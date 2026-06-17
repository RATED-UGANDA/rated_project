const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const scraperController = require('../controllers/scraper.controller');

const router = Router();

router.post('/refresh', authenticate, requireRole('administrator', 'super_admin'), scraperController.refreshImages);

module.exports = router;
