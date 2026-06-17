const { Router } = require('express');
const { validateBody } = require('../middleware/validate');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/register', validateBody({
  full_name: { required: true, minLength: 2 },
  email: { required: true, email: true },
  password: { required: true, minLength: 6 },
  phone_number: { required: false },
}), authController.register);

router.post('/login', validateBody({
  email: { required: true },
  password: { required: true },
}), authController.login);

module.exports = router;
