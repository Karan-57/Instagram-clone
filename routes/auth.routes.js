const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/auth.controller');

router.get('/', authController.getHomePage);
router.get('/login', authController.getLoginPage);
router.post('/register', authController.registerUser);
router.post('/login', passport.authenticate('local', {
    successRedirect: '/feed',
    failureRedirect: '/login'
}), function (req, res) {});
router.get('/logout', authController.logoutUser);

module.exports = router;
