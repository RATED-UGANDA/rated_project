const pool = require('../config/db');

async function findByUserId(userId) {
  const [rows] = await pool.execute('SELECT * FROM editors WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function create(userId) {
  const [result] = await pool.execute(
    'INSERT INTO editors (user_id, editor_level, department, approval_limit) VALUES (?, ?, NULL, NULL)',
    [userId, 'junior']
  );
  return result.insertId;
}

module.exports = { findByUserId, create };
