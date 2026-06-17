const pool = require('../config/db');

async function create({ article_id, file_url, media_type }) {
  const [result] = await pool.execute(
    'INSERT INTO media (article_id, file_url, media_type) VALUES (?, ?, ?)',
    [article_id, file_url, media_type]
  );
  return result.insertId;
}

async function findByArticle(articleId) {
  const [rows] = await pool.execute(
    'SELECT * FROM media WHERE article_id = ? ORDER BY uploaded_at ASC',
    [articleId]
  );
  return rows;
}

module.exports = { create, findByArticle };
