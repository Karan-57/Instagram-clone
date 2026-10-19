require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { cleanExpiredStories } = require('./controllers/story.controller');

connectDB();

// Run story cleanup every hour to purge expired stories from ImageKit and MongoDB
setInterval(() => {
    cleanExpiredStories().catch(err => console.error("Story cleanup error:", err));
}, 60 * 60 * 1000).unref();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
