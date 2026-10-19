const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const postRoutes = require('./post.routes');
const userRoutes = require('./user.routes');
const storyRoutes = require('./story.routes');

router.use('/', authRoutes);
router.use('/', postRoutes);
router.use('/', userRoutes);
router.use('/', storyRoutes);

module.exports = router;