const pool = require('../config/db');

async function findByArticle(articleId) {
  const [rows] = await pool.execute(
    `SELECT c.*, u.full_name
     FROM comments c
     JOIN users u ON c.user_id = u.user_id
     WHERE c.article_id = ?
     ORDER BY c.created_at DESC`,
    [articleId]
  );
  return rows;
}

async function create({ article_id, user_id, comment_text }) {
  const [result] = await pool.execute(
    'INSERT INTO comments (article_id, user_id, comment_text) VALUES (?, ?, ?)',
    [article_id, user_id, comment_text]
  );
  return result.insertId;
}

module.exports = { findByArticle, create };
