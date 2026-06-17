const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateBody } = require('../middleware/validate');
const categoryController = require('../controllers/category.controller');

const router = Router();

router.get('/', categoryController.listCategories);
router.post('/', authenticate, requireRole('administrator', 'super_admin'), validateBody({
  category_name: { required: true, minLength: 2 },
  description: { required: false },
}), categoryController.createCategory);

module.exports = router;
