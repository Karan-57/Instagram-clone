const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');

router.post('/story/upload', isLoggedIn, upload.single('image'), storyController.uploadStory);
router.post('/story/delete/:id', isLoggedIn, storyController.deleteStory);
router.delete('/story/:id', isLoggedIn, storyController.deleteStory);

module.exports = router;
