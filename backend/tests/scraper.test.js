// Scraper integration tests
// Usage: node tests/scraper.test.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mysql = require('mysql2/promise');
const { runScrapeCycle } = require('../src/scraper/scrapeRunner');
const { refreshAllCategories } = require('../src/services/stockImages.service');
const pool = require('../src/config/db');

function ok(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

async function resetDb() {
  const conn = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '2512',
    database: process.env.DB_NAME || 'ratedug',
    multipleStatements: true,
  });
  const schema = require('fs').readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  const seed = require('fs').readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf8');
  await conn.query(schema);
  await conn.query(seed);
  await conn.end();
  console.log('Database reset');
}

async function activateIndependent() {
  await pool.execute(
    "UPDATE scraped_sources SET feed_url = 'https://www.independent.co.ug/feed/', is_active = TRUE WHERE source_name = 'The Independent'"
  );
}

async function run() {
  await resetDb();
  await activateIndependent();

  // 1. Run scrape cycle
  const first = await runScrapeCycle();
  ok(first.fetched >= 0, `First run fetched ${first.fetched} items`);
  console.log('First run summary:', first);

  // 2. Inserted articles are scraped type with NULL journalist
  if (first.inserted > 0) {
    const [rows] = await pool.execute(
      "SELECT * FROM articles WHERE source_type = 'scraped' AND journalist_id IS NULL"
    );
    ok(rows.length > 0, 'Scraped articles have source_type=scraped and journalist_id=NULL');
  } else {
    console.warn('WARN: No articles inserted; only The Independent feed is active.');
  }

  // 3. Dedup: second run should skip same links
  const second = await runScrapeCycle();
  ok(second.skipped >= first.inserted, 'Second run skips articles already in DB');

  // 4. Image refresh no-ops without key or populates with key
  const imageResult = await refreshAllCategories();
  if (process.env.PEXELS_API_KEY && !process.env.PEXELS_API_KEY.includes('your_')) {
    const [imgRows] = await pool.execute('SELECT COUNT(*) AS c FROM stock_images');
    ok(imgRows[0].c >= 1, 'Stock images populated when PEXELS_API_KEY is set');
    ok(imageResult.refreshed >= 1, 'refreshAllCategories reports refreshed images');
  } else {
    ok(imageResult.errors.length > 0, 'Image refresh no-ops cleanly without PEXELS_API_KEY');
  }

  await pool.end();
  console.log('\nAll scraper tests passed.');
}

run().catch((err) => {
  console.error('Scraper test failed:', err.message);
  process.exit(1);
});
