const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

const router = Router();

router.get('/me', authenticate, authController.me);

module.exports = router;
