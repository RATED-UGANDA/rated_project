const authService = require('../services/auth.service');
const userModel = require('../models/user.model');
const journalistModel = require('../models/journalist.model');
const readerModel = require('../models/reader.model');
const editorModel = require('../models/editor.model');
const adminModel = require('../models/admin.model');
const superAdminModel = require('../models/superAdmin.model');

async function register(req, res, next) {
  try {
    const { full_name, email, password, phone_number } = req.body;
    const existing = await userModel.findByEmail(email);
    if (existing) {
      const err = new Error('Email already registered');
      err.status = 409;
      err.code = 'EMAIL_EXISTS';
      throw err;
    }
    const userId = await userModel.create({
      full_name,
      email,
      password: authService.hashPassword(password),
      phone_number,
    });
    await userModel.addRole(userId, 'reader');
    await readerModel.create(userId);
    res.status(201).json({
      data: { message: 'Registration pending admin approval. You have been given reader access.' },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user || !authService.comparePassword(password, user.password)) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }
    const roles = await userModel.getRoles(user.user_id);
    const roleNames = roles.map((r) => r.role_name);
    const token = authService.signToken({ user_id: user.user_id, roles: roleNames });
    res.json({
      data: {
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          roles: roleNames,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    res.json({ data: req.user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
