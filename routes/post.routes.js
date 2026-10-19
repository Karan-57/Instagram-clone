const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');

router.get('/feed', isLoggedIn, postController.getFeed);
router.get('/upload', isLoggedIn, postController.getUploadPage);
router.post('/upload', isLoggedIn, upload.single('image'), postController.createPost);
router.get('/like/post/:id', isLoggedIn, postController.likePost);
router.get('/comments/:id', isLoggedIn, postController.getComments);
router.post('/comments/:id', isLoggedIn, postController.addComment);
router.get('/like/comment/:postId/:id', isLoggedIn, postController.likeComment);

module.exports = router;
