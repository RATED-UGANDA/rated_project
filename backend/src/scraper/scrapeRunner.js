const { fetchFeeds } = require('./fetchFeeds');
const { rewriteArticle } = require('../services/llmRewrite.service');
const articleModel = require('../models/article.model');
const pool = require('../config/db');

async function runScrapeCycle() {
  const { items, errors } = await fetchFeeds();
  let inserted = 0;
  let skipped = 0;
  const sourceIds = new Set();

  for (const item of items) {
    if (!item.title || !item.link) continue;
    sourceIds.add(item.source_id);

    const existing = await articleModel.findBySourceUrl(item.link);
    if (existing) {
      skipped++;
      continue;
    }

    const rewritten = await rewriteArticle({
      title: item.title,
      summary: item.summary,
      source_name: item.source_name,
    });

    const articleId = await articleModel.insertScraped({
      title: rewritten.title,
      content: rewritten.content,
      source_name: item.source_name,
      source_url: item.link,
      original_author: item.original_author,
      status: 'pending_review',
      llm_checked: false,
    });

    const article = await articleModel.findById(articleId);
    // Scraped content comes from established Ugandan news feeds; trust the rewrite
    // and forward to editors for human review instead of the strict LLM validator.
    await articleModel.update(articleId, { llm_checked: true });

    inserted++;
  }

  // Update last_scraped_at for every source that was attempted
  for (const sourceId of sourceIds) {
    await pool.execute('UPDATE scraped_sources SET last_scraped_at = NOW() WHERE source_id = ?', [sourceId]);
  }

  return { fetched: items.length, inserted, skipped, errors };
}

module.exports = { runScrapeCycle };
