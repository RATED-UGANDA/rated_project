const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const commentController = require('../controllers/comment.controller');

const router = Router();

router.get('/:articleId', commentController.listComments);
router.post('/', authenticate, validateBody({
  article_id: { required: true },
  comment_text: { required: true, minLength: 1 },
}), commentController.createComment);

module.exports = router;
