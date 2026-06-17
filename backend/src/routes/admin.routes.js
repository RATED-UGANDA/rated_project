const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const adminController = require('../controllers/admin.controller');

const router = Router();

router.get('/users', authenticate, requireRole('administrator', 'super_admin'), adminController.listUsers);
router.get('/users/pending', authenticate, requireRole('administrator', 'super_admin'), adminController.listPendingUsers);
router.patch('/users/:id/approve', authenticate, requireRole('administrator', 'super_admin'), adminController.approveUser);
router.patch('/users/:id/roles', authenticate, requireRole('administrator', 'super_admin'), adminController.assignRole);

module.exports = router;
