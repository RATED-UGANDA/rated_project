const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT user_id, full_name, email, phone_number, profile_picture, created_at, updated_at FROM users WHERE user_id = ?', [id]);
  return rows[0] || null;
}

async function create({ full_name, email, password, phone_number }) {
  const [result] = await pool.execute(
    'INSERT INTO users (full_name, email, password, phone_number) VALUES (?, ?, ?, ?)',
    [full_name, email, password, phone_number || null]
  );
  return result.insertId;
}

async function getRoles(userId) {
  const [rows] = await pool.execute(
    `SELECT r.role_name FROM user_roles ur
     JOIN roles r ON ur.role_id = r.role_id
     WHERE ur.user_id = ?`,
    [userId]
  );
  return rows;
}

async function addRole(userId, roleName) {
  await pool.execute(
    `INSERT INTO user_roles (user_id, role_id)
     SELECT ?, role_id FROM roles WHERE role_name = ?
     ON DUPLICATE KEY UPDATE user_role_id=user_role_id`,
    [userId, roleName]
  );
}

async function findAllPending() {
  const [rows] = await pool.execute(
    `SELECT u.user_id, u.full_name, u.email, u.phone_number, u.created_at,
            GROUP_CONCAT(r.role_name) AS roles
     FROM users u
     LEFT JOIN user_roles ur ON u.user_id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.role_id
     WHERE NOT EXISTS (
       SELECT 1 FROM user_roles ur2 JOIN roles r2 ON ur2.role_id = r2.role_id
       WHERE ur2.user_id = u.user_id AND r2.role_name IN ('journalist','editor','administrator','super_admin')
     )
     GROUP BY u.user_id
     ORDER BY u.created_at DESC`
  );
  return rows;
}

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT u.user_id, u.full_name, u.email, u.phone_number, u.created_at,
            GROUP_CONCAT(r.role_name) AS roles
     FROM users u
     LEFT JOIN user_roles ur ON u.user_id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.role_id
     GROUP BY u.user_id
     ORDER BY u.created_at DESC`
  );
  return rows;
}

module.exports = {
  findByEmail,
  findById,
  create,
  getRoles,
  addRole,
  findAllPending,
  findAll,
};
