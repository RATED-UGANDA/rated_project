const pool = require('../config/db');

async function findByUserId(userId) {
  const [rows] = await pool.execute('SELECT * FROM admin WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function create(userId) {
  const [result] = await pool.execute(
    'INSERT INTO admin (user_id, admin_level, permissions) VALUES (?, ?, NULL)',
    [userId, 'standard']
  );
  return result.insertId;
}

module.exports = { findByUserId, create };
