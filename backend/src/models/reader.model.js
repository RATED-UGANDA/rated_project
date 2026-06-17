const pool = require('../config/db');

async function findByUserId(userId) {
  const [rows] = await pool.execute('SELECT * FROM readers WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function create(userId) {
  const [result] = await pool.execute(
    'INSERT INTO readers (user_id, preferences, subscription_status) VALUES (?, NULL, ?)',
    [userId, 'free']
  );
  return result.insertId;
}

module.exports = { findByUserId, create };
