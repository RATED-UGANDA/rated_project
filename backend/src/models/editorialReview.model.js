const pool = require('../config/db');

async function create({ article_id, review_status, feedback, reviewer_id }) {
  const [result] = await pool.execute(
    'INSERT INTO editorial_reviews (article_id, review_status, feedback, reviewer_id) VALUES (?, ?, ?, ?)',
    [article_id, review_status, feedback || null, reviewer_id || null]
  );
  return result.insertId;
}

module.exports = { create };
