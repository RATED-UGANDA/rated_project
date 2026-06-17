const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.execute('SELECT * FROM categories ORDER BY category_name');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM categories WHERE category_id = ?', [id]);
  return rows[0] || null;
}

async function create({ category_name, description, admin_id }) {
  const [result] = await pool.execute(
    'INSERT INTO categories (category_name, description, admin_id) VALUES (?, ?, ?)',
    [category_name, description || null, admin_id || null]
  );
  return result.insertId;
}

async function findByName(name) {
  const [rows] = await pool.execute('SELECT * FROM categories WHERE category_name = ?', [name]);
  return rows[0] || null;
}

module.exports = { findAll, findById, create, findByName };
