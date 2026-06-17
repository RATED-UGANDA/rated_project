const commentModel = require('../models/comment.model');

async function listComments(req, res, next) {
  try {
    const comments = await commentModel.findByArticle(req.params.articleId);
    res.json({ data: comments });
  } catch (err) {
    next(err);
  }
}

async function createComment(req, res, next) {
  try {
    const commentId = await commentModel.create({
      article_id: req.body.article_id,
      user_id: req.user.user_id,
      comment_text: req.body.comment_text,
    });
    const comments = await commentModel.findByArticle(req.body.article_id);
    const comment = comments.find((c) => c.comment_id === commentId);
    res.status(201).json({ data: comment });
  } catch (err) {
    next(err);
  }
}

module.exports = { listComments, createComment };
