const Parser = require('rss-parser');
const pool = require('../config/db');

const parser = new Parser({ timeout: 15000 });

function stripHtml(text) {
  if (!text) return '';
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchFeeds() {
  const [sources] = await pool.execute(
    'SELECT * FROM scraped_sources WHERE is_active = TRUE ORDER BY source_id'
  );

  const allItems = [];
  const errors = [];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.feed_url);
      const items = (feed.items || []).slice(0, 20).map((item) => ({
        title: item.title ? item.title.trim() : '',
        summary: stripHtml(item.contentSnippet || item.description || item.summary || ''),
        link: item.link ? item.link.trim() : '',
        pubDate: item.pubDate || item.isoDate || null,
        original_author: item.creator || item.author || item['dc:creator'] || null,
        source_name: source.source_name,
        source_id: source.source_id,
      }));
      allItems.push(...items);
    } catch (err) {
      errors.push({ source: source.source_name, error: err.message });
    }
  }

  return { items: allItems, errors };
}

module.exports = { fetchFeeds };
