const articleModel = require('../models/article.model');
const journalistModel = require('../models/journalist.model');
const mediaModel = require('../models/media.model');
const editorialReviewModel = require('../models/editorialReview.model');
const llmValidation = require('../services/llmValidation.service');

async function listArticles(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const result = await articleModel.findAllPublished({
      category: req.query.category,
      district: req.query.district,
      search: req.query.search,
      page,
    });
    for (const article of result.articles) {
      article.views = await articleModel.countViews(article.article_id);
    }
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

async function getArticle(req, res, next) {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article || article.status !== 'published') {
      const err = new Error('Article not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const isAuthor = req.user && article.journalist_id && req.user.journalist_id === article.journalist_id;
    if (!isAuthor) {
      await articleModel.addView(article.article_id, req.user ? req.user.user_id : null);
    }
    article.views = await articleModel.countViews(article.article_id);
    res.json({ data: article });
  } catch (err) {
    next(err);
  }
}

async function createArticle(req, res, next) {
  try {
    const journalist = await journalistModel.findByUserId(req.user.user_id);
    if (!journalist) {
      const err = new Error('Journalist profile not found');
      err.status = 403;
      err.code = 'NO_JOURNALIST_PROFILE';
      throw err;
    }
    const articleId = await articleModel.create({
      title: req.body.title,
      content: req.body.content,
      category_id: req.body.category_id,
      district_id: req.body.district_id,
      journalist_id: journalist.journalist_id,
      status: 'draft',
    });
    const article = await articleModel.findById(articleId);
    res.status(201).json({ data: article });
  } catch (err) {
    next(err);
  }
}

async function updateArticle(req, res, next) {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) {
      const err = new Error('Article not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const journalist = await journalistModel.findByUserId(req.user.user_id);
    if (!journalist || article.journalist_id !== journalist.journalist_id) {
      const err = new Error('Forbidden');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    if (!['draft', 'returned'].includes(article.status)) {
      const err = new Error('Cannot edit article in current status');
      err.status = 400;
      err.code = 'INVALID_STATUS';
      throw err;
    }
    await articleModel.update(req.params.id, {
      title: req.body.title,
      content: req.body.content,
      category_id: req.body.category_id,
      district_id: req.body.district_id,
      status: 'draft',
    });
    const updated = await articleModel.findById(req.params.id);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

async function submitArticle(req, res, next) {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) {
      const err = new Error('Article not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const journalist = await journalistModel.findByUserId(req.user.user_id);
    if (!journalist || article.journalist_id !== journalist.journalist_id) {
      const err = new Error('Forbidden');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    await articleModel.update(req.params.id, { status: 'pending_review', llm_checked: false });
    const validation = await llmValidation.validateArticle(article);
    if (validation.valid) {
      await articleModel.update(req.params.id, { llm_checked: true });
    } else {
      await articleModel.update(req.params.id, { status: 'rejected' });
      await editorialReviewModel.create({
        article_id: req.params.id,
        review_status: 'auto_rejected',
        feedback: validation.reason || 'Failed automated content validation',
        reviewer_id: null,
      });
    }
    const updated = await articleModel.findById(req.params.id);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

async function uploadMedia(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error('No file uploaded');
      err.status = 400;
      err.code = 'NO_FILE';
      throw err;
    }
    const article = await articleModel.findById(req.params.id);
    if (!article) {
      const err = new Error('Article not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const journalist = await journalistModel.findByUserId(req.user.user_id);
    if (!journalist || article.journalist_id !== journalist.journalist_id) {
      const err = new Error('Forbidden');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    await mediaModel.create({
      article_id: req.params.id,
      file_url: fileUrl,
      media_type: req.file.mimetype,
    });
    if (!article.cover_image_url && article.source_type === 'staff') {
      await articleModel.update(req.params.id, { cover_image_url: fileUrl });
    }
    res.json({ data: { file_url: fileUrl } });
  } catch (err) {
    next(err);
  }
}

async function getMyArticles(req, res, next) {
  try {
    const journalist = await journalistModel.findByUserId(req.user.user_id);
    if (!journalist) {
      return res.json({ data: [] });
    }
    const articles = await articleModel.findByJournalist(journalist.journalist_id);
    res.json({ data: articles });
  } catch (err) {
    next(err);
  }
}

async function getEditorQueue(req, res, next) {
  try {
    const articles = await articleModel.findEditorQueue();
    res.json({ data: articles });
  } catch (err) {
    next(err);
  }
}

async function reviewArticle(req, res, next) {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) {
      const err = new Error('Article not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    const { decision, feedback, category_id, district_id } = req.body;
    if (!['approve', 'return', 'reject'].includes(decision)) {
      const err = new Error('Invalid decision');
      err.status = 400;
      err.code = 'INVALID_DECISION';
      throw err;
    }
    if (article.source_type === 'scraped' && decision === 'return') {
      const err = new Error('Scraped articles cannot be returned for correction');
      err.status = 400;
      err.code = 'CANNOT_RETURN_SCRAPED';
      throw err;
    }
    if (article.source_type === 'scraped' && decision === 'approve') {
      if (!category_id) {
        const err = new Error('Category is required when approving a scraped article');
        err.status = 400;
        err.code = 'CATEGORY_REQUIRED';
        throw err;
      }
      const stockImages = require('../services/stockImages.service');
      const image = await stockImages.getRandomStockImage(category_id);
      await articleModel.update(req.params.id, {
        status: 'published',
        published_at: new Date(),
        category_id,
        district_id: district_id || null,
        cover_image_url: image.image_url,
        cover_image_credit: image.credit_text,
      });
    } else if (decision === 'approve') {
      await articleModel.update(req.params.id, {
        status: 'published',
        published_at: new Date(),
        category_id: category_id || article.category_id,
        district_id: district_id || article.district_id,
      });
    } else if (decision === 'return') {
      await articleModel.update(req.params.id, { status: 'returned' });
    } else if (decision === 'reject') {
      await articleModel.update(req.params.id, { status: 'rejected' });
    }
    await editorialReviewModel.create({
      article_id: req.params.id,
      review_status: decision === 'approve' ? 'approved' : decision === 'return' ? 'returned' : 'rejected',
      feedback: feedback || null,
      reviewer_id: req.user.user_id,
    });
    const updated = await articleModel.findById(req.params.id);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

async function addView(req, res, next) {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: { message: 'Article not found', code: 'NOT_FOUND' } });
    }
    await articleModel.addView(req.params.id, req.user ? req.user.user_id : null);
    res.json({ data: { message: 'View recorded' } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listArticles,
  getArticle,
  createArticle,
  updateArticle,
  submitArticle,
  uploadMedia,
  getMyArticles,
  getEditorQueue,
  reviewArticle,
  addView,
};
