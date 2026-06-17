const pool = require('../config/db');

async function findAllPublished({ category, district, search, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  let where = 'WHERE a.status = ?';
  const params = ['published'];

  if (category) {
    where += ' AND a.category_id = ?';
    params.push(category);
  }
  if (district) {
    where += ' AND a.district_id = ?';
    params.push(district);
  }
  if (search) {
    where += ' AND MATCH(a.title, a.content) AGAINST(? IN NATURAL LANGUAGE MODE)';
    params.push(search);
  }

  const countSql = `SELECT COUNT(*) AS total FROM articles a ${where}`;
  const [countRows] = await pool.execute(countSql, params);

  const dataSql = `
    SELECT a.*, c.category_name, d.district_name, j.journalist_id,
           u.full_name AS journalist_name
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.category_id
    LEFT JOIN districts d ON a.district_id = d.district_id
    LEFT JOIN journalists j ON a.journalist_id = j.journalist_id
    LEFT JOIN users u ON j.user_id = u.user_id
    ${where}
    ORDER BY a.published_at DESC
    LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}
  `;
  const [rows] = await pool.execute(dataSql, params);

  return { articles: rows, total: countRows[0].total, page, limit };
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT a.*, c.category_name, d.district_name, j.journalist_id, u.full_name AS journalist_name
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.category_id
     LEFT JOIN districts d ON a.district_id = d.district_id
     LEFT JOIN journalists j ON a.journalist_id = j.journalist_id
     LEFT JOIN users u ON j.user_id = u.user_id
     WHERE a.article_id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ title, content, category_id, district_id, journalist_id, status = 'draft' }) {
  const [result] = await pool.execute(
    'INSERT INTO articles (title, content, category_id, district_id, journalist_id, status, source_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, content, category_id || null, district_id || null, journalist_id, status, 'staff']
  );
  return result.insertId;
}

async function update(id, fields) {
  const allowed = ['title', 'content', 'category_id', 'district_id', 'status', 'llm_checked', 'published_at', 'cover_image_url', 'cover_image_credit'];
  const updates = [];
  const values = [];
  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }
  if (updates.length === 0) return false;
  values.push(id);
  const sql = `UPDATE articles SET ${updates.join(', ')} WHERE article_id = ?`;
  await pool.execute(sql, values);
  return true;
}

async function findByJournalist(journalistId) {
  const [rows] = await pool.execute(
    `SELECT a.*, c.category_name, d.district_name
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.category_id
     LEFT JOIN districts d ON a.district_id = d.district_id
     WHERE a.journalist_id = ?
     ORDER BY a.created_at DESC`,
    [journalistId]
  );
  return rows;
}

async function findEditorQueue() {
  const [rows] = await pool.execute(
    `SELECT a.*, c.category_name, d.district_name, j.journalist_id, u.full_name AS journalist_name
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.category_id
     LEFT JOIN districts d ON a.district_id = d.district_id
     LEFT JOIN journalists j ON a.journalist_id = j.journalist_id
     LEFT JOIN users u ON j.user_id = u.user_id
     WHERE a.status = 'pending_review' AND a.llm_checked = TRUE
     ORDER BY a.created_at ASC`
  );
  return rows;
}

async function findBySourceUrl(sourceUrl) {
  const [rows] = await pool.execute('SELECT article_id FROM articles WHERE source_url = ?', [sourceUrl]);
  return rows[0] || null;
}

async function insertScraped({ title, content, source_name, source_url, original_author, status = 'pending_review', llm_checked = false }) {
  const [result] = await pool.execute(
    'INSERT INTO articles (title, content, source_type, source_name, source_url, original_author, status, llm_checked, journalist_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)',
    [title, content, 'scraped', source_name, source_url, original_author, status, llm_checked]
  );
  return result.insertId;
}

async function countViews(articleId) {
  const [rows] = await pool.execute('SELECT COUNT(*) AS views FROM article_views WHERE article_id = ?', [articleId]);
  return rows[0].views;
}

async function addView(articleId, userId) {
  await pool.execute('INSERT INTO article_views (article_id, user_id) VALUES (?, ?)', [articleId, userId || null]);
}

module.exports = {
  findAllPublished,
  findById,
  create,
  update,
  findByJournalist,
  findEditorQueue,
  findBySourceUrl,
  insertScraped,
  countViews,
  addView,
};
