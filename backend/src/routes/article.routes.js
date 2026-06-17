const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validateBody } = require('../middleware/validate');
const articleController = require('../controllers/article.controller');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

router.get('/', articleController.listArticles);
router.get('/queue/editor', authenticate, requireRole('editor', 'super_admin'), articleController.getEditorQueue);
router.post('/', authenticate, requireRole('journalist', 'editor', 'super_admin'), validateBody({
  title: { required: true, minLength: 5 },
  content: { required: true, minLength: 50 },
  category_id: { required: false },
  district_id: { required: false },
}), articleController.createArticle);
router.get('/mine', authenticate, requireRole('journalist', 'editor', 'super_admin'), articleController.getMyArticles);
router.patch('/:id', authenticate, requireRole('journalist', 'editor', 'super_admin'), articleController.updateArticle);
router.post('/:id/submit', authenticate, requireRole('journalist', 'editor', 'super_admin'), articleController.submitArticle);
router.post('/:id/media', authenticate, requireRole('journalist', 'editor', 'super_admin'), upload.single('file'), articleController.uploadMedia);
router.post('/:id/review', authenticate, requireRole('editor', 'super_admin'), articleController.reviewArticle);
router.post('/:id/views', articleController.addView);
router.get('/:id', articleController.getArticle);

module.exports = router;
