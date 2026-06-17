// One-time script to verify RSS feed URLs and activate working sources.
// Run: node src/scraper/verifySources.js

require('dotenv').config();
const Parser = require('rss-parser');
const pool = require('../config/db');
const seedSources = require('./sources');

const parser = new Parser({ timeout: 15000 });

async function run() {
  for (const source of seedSources) {
    try {
      const feed = await parser.parseURL(source.feed_url);
      const itemCount = feed.items ? feed.items.length : 0;
      await pool.execute(
        'UPDATE scraped_sources SET feed_url = ?, is_active = TRUE, last_scraped_at = NOW() WHERE source_name = ?',
        [source.feed_url, source.source_name]
      );
      console.log(`ACTIVE: ${source.source_name} (${itemCount} items) -> ${source.feed_url}`);
    } catch (err) {
      await pool.execute(
        'UPDATE scraped_sources SET feed_url = ?, is_active = FALSE WHERE source_name = ?',
        [source.feed_url, source.source_name]
      );
      console.log(`INACTIVE: ${source.source_name} -> ${err.message}`);
    }
  }
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
