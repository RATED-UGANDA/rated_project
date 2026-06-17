const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.execute('SELECT * FROM districts ORDER BY district_name');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM districts WHERE district_id = ?', [id]);
  return rows[0] || null;
}

async function create({ district_name, region, admin_id }) {
  const [result] = await pool.execute(
    'INSERT INTO districts (district_name, region, admin_id) VALUES (?, ?, ?)',
    [district_name, region || null, admin_id || null]
  );
  return result.insertId;
}

module.exports = { findAll, findById, create };
