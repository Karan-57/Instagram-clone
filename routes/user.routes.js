const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { isLoggedIn } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');

router.get('/profile', isLoggedIn, userController.getProfile);
router.get('/edit', isLoggedIn, userController.getEditPage);
router.post('/update', isLoggedIn, upload.single('image'), userController.updateProfile);
router.get('/search', isLoggedIn, userController.getSearchPage);
router.get('/username/:username', isLoggedIn, userController.getUserByUsername);
router.get('/userprofile', userController.getUserProfilePage);

module.exports = router;
