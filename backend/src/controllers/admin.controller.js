const userModel = require('../models/user.model');
const journalistModel = require('../models/journalist.model');
const readerModel = require('../models/reader.model');
const editorModel = require('../models/editor.model');
const adminModel = require('../models/admin.model');
const superAdminModel = require('../models/superAdmin.model');
const pool = require('../config/db');

async function listUsers(req, res, next) {
  try {
    const users = await userModel.findAll();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

async function listPendingUsers(req, res, next) {
  try {
    const users = await userModel.findAllPending();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

async function approveUser(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    await userModel.addRole(req.params.id, 'reader');
    if (!(await readerModel.findByUserId(req.params.id))) {
      await readerModel.create(req.params.id);
    }
    res.json({ data: { message: 'User approved as reader' } });
  } catch (err) {
    next(err);
  }
}

async function assignRole(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { role_name } = req.body;
    if (!role_name) {
      const err = new Error('role_name is required');
      err.status = 400;
      err.code = 'ROLE_REQUIRED';
      throw err;
    }

    const callerIsSuperAdmin = req.user.roles.includes('super_admin');
    if (role_name === 'super_admin' && !callerIsSuperAdmin) {
      const err = new Error('Only super_admin can assign super_admin role');
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }

    const user = await userModel.findById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }

    await connection.execute(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT ?, role_id FROM roles WHERE role_name = ?
       ON DUPLICATE KEY UPDATE user_role_id=user_role_id`,
      [req.params.id, role_name]
    );

    if (role_name === 'journalist') {
      const [existing] = await connection.execute('SELECT journalist_id FROM journalists WHERE user_id = ?', [req.params.id]);
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO journalists (user_id, staff_number, specialization, employment_date, verification_status) VALUES (?, ?, NULL, CURDATE(), ?)',
          [req.params.id, `J-${req.params.id}`, 'pending']
        );
      }
    } else if (role_name === 'reader') {
      const [existing] = await connection.execute('SELECT reader_id FROM readers WHERE user_id = ?', [req.params.id]);
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO readers (user_id, preferences, subscription_status) VALUES (?, NULL, ?)',
          [req.params.id, 'free']
        );
      }
    } else if (role_name === 'editor') {
      const [existing] = await connection.execute('SELECT editor_id FROM editors WHERE user_id = ?', [req.params.id]);
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO editors (user_id, editor_level, department, approval_limit) VALUES (?, ?, NULL, NULL)',
          [req.params.id, 'junior']
        );
      }
    } else if (role_name === 'administrator') {
      const [existing] = await connection.execute('SELECT admin_id FROM admin WHERE user_id = ?', [req.params.id]);
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO admin (user_id, admin_level, permissions) VALUES (?, ?, NULL)',
          [req.params.id, 'standard']
        );
      }
    } else if (role_name === 'super_admin') {
      const [existing] = await connection.execute('SELECT super_admin_id FROM super_admin WHERE user_id = ?', [req.params.id]);
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO super_admin (user_id, access_level, system_permissions) VALUES (?, ?, NULL)',
          [req.params.id, 'full']
        );
      }
    }

    await connection.commit();
    res.json({ data: { message: `Role ${role_name} assigned` } });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

module.exports = { listUsers, listPendingUsers, approveUser, assignRole };
