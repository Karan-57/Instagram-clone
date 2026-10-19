const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const postRoutes = require('./post.routes');
const userRoutes = require('./user.routes');

router.use('/', authRoutes);
router.use('/', postRoutes);
router.use('/', userRoutes);

module.exports = router;