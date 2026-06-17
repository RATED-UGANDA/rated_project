const pool = require('../config/db');

async function findByUserId(userId) {
  const [rows] = await pool.execute('SELECT * FROM super_admin WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function create(userId) {
  const [result] = await pool.execute(
    'INSERT INTO super_admin (user_id, access_level, system_permissions) VALUES (?, ?, NULL)',
    [userId, 'full']
  );
  return result.insertId;
}

module.exports = { findByUserId, create };
