const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateBody } = require('../middleware/validate');
const districtController = require('../controllers/district.controller');

const router = Router();

router.get('/', districtController.listDistricts);
router.post('/', authenticate, requireRole('administrator', 'super_admin'), validateBody({
  district_name: { required: true, minLength: 2 },
  region: { required: false },
}), districtController.createDistrict);

module.exports = router;
