const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const userModel = require('../models/user.model');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: { message: 'Unauthorized', code: 'NO_TOKEN' } });
    }
    const token = header.slice(7);
    const decoded = authService.verifyToken(token);
    const user = await userModel.findById(decoded.user_id);
    if (!user) {
      return res.status(401).json({ error: { message: 'User not found', code: 'USER_NOT_FOUND' } });
    }
    const roles = await userModel.getRoles(decoded.user_id);
    req.user = {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      roles: roles.map((r) => r.role_name),
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' } });
  }
}

module.exports = { authenticate };
