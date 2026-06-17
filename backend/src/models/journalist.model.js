const pool = require('../config/db');

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM journalists WHERE journalist_id = ?', [id]);
  return rows[0] || null;
}

async function findByUserId(userId) {
  const [rows] = await pool.execute('SELECT * FROM journalists WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function create(userId, staffNumber, specialization = null, verificationStatus = 'pending') {
  const [result] = await pool.execute(
    'INSERT INTO journalists (user_id, staff_number, specialization, employment_date, verification_status) VALUES (?, ?, ?, CURDATE(), ?)',
    [userId, staffNumber, specialization, verificationStatus]
  );
  return result.insertId;
}

module.exports = { findById, findByUserId, create };
