const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateBody } = require('../middleware/validate');
const scraperController = require('../controllers/scraper.controller');

const router = Router();

router.get('/sources', authenticate, requireRole('administrator', 'super_admin'), scraperController.listSources);
router.post('/sources', authenticate, requireRole('administrator', 'super_admin'), validateBody({
  source_name: { required: true, minLength: 2 },
  feed_url: { required: true, minLength: 5 },
  site_url: { required: false },
  is_active: { required: false },
}), scraperController.createSource);
router.patch('/sources/:id', authenticate, requireRole('administrator', 'super_admin'), validateBody({
  is_active: { required: true },
}), scraperController.updateSource);
router.post('/run', authenticate, requireRole('administrator', 'super_admin'), scraperController.runScraper);
router.get('/runs/last', authenticate, requireRole('administrator', 'super_admin'), scraperController.getLastRun);

module.exports = router;
