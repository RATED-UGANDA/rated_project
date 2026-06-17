const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.execute('SELECT * FROM scraped_sources ORDER BY source_id');
  return rows;
}

async function update(sourceId, fields) {
  const allowed = ['feed_url', 'is_active'];
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }
  if (updates.length === 0) return false;
  values.push(sourceId);
  await pool.execute(`UPDATE scraped_sources SET ${updates.join(', ')} WHERE source_id = ?`, values);
  return true;
}

async function getLastRunSummary() {
  const [rows] = await pool.execute(
    'SELECT source_name, last_scraped_at FROM scraped_sources WHERE is_active = TRUE ORDER BY last_scraped_at DESC LIMIT 1'
  );
  return rows[0] || null;
}

module.exports = { findAll, update, getLastRunSummary };
