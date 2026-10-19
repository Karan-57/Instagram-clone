const { userModel, storyModel } = require('../models');
const { uploadStoryToImageKit, deleteFromImageKit } = require('../services/imagekit.service');

const STORY_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Purge expired stories from ImageKit and MongoDB
 */
async function cleanExpiredStories() {
    try {
        const cutoff = new Date(Date.now() - STORY_DURATION_MS);
        const expiredStories = await storyModel.find({ date: { $lt: cutoff } });

        if (expiredStories.length > 0) {
            console.log(`Found ${expiredStories.length} expired stories to clean up.`);
            for (const s of expiredStories) {
                if (s.fileId) {
                    await deleteFromImageKit(s.fileId);
                }
                await userModel.updateOne(
                    { _id: s.user },
                    { $pull: { stories: s._id } }
                );
            }
            await storyModel.deleteMany({ _id: { $in: expiredStories.map(s => s._id) } });
            console.log("Expired stories cleanup completed.");
        }
    } catch (err) {
        console.error("Error during cleanExpiredStories:", err.message);
    }
}

/**
 * Fetch and group active stories for the feed
 * @param {Object} currentUser
 * @returns {Promise<{ myStories: Array, otherStories: Array }>}
 */
async function getActiveStoriesForFeed(currentUser) {
    // Run cleanup for expired stories first
    await cleanExpiredStories();

    const cutoff = new Date(Date.now() - STORY_DURATION_MS);
    const activeStories = await storyModel.find({ date: { $gte: cutoff } })
        .populate('user', 'username name profileImage')
        .sort({ date: 1 });

    const myStories = [];
    const otherMap = new Map();

    for (const st of activeStories) {
        if (!st.user) continue;

        if (st.user._id.toString() === currentUser._id.toString()) {
            myStories.push({
                _id: st._id,
                story: st.story,
                date: st.date
            });
        } else {
            const uid = st.user._id.toString();
            if (!otherMap.has(uid)) {
                otherMap.set(uid, {
                    user: {
                        _id: st.user._id,
                        username: st.user.username,
                        name: st.user.name,
                        profileImage: st.user.profileImage
                    },
                    stories: []
                });
            }
            otherMap.get(uid).stories.push({
                _id: st._id,
                story: st.story,
                date: st.date
            });
        }
    }

    return {
        myStories,
        otherStories: Array.from(otherMap.values())
    };
}

/**
 * POST /story/upload
 * Upload a new story photo
 */
async function uploadStory(req, res) {
    try {
        const user = await userModel.findOne({ username: req.user.username });
        if (!user) {
            return res.redirect('/login');
        }

        if (!req.file) {
            return res.redirect('/feed');
        }

        const fileName = `story_${Date.now()}_${req.file.originalname}`;
        const { url, fileId } = await uploadStoryToImageKit(req.file.buffer, fileName);

        const newStory = await storyModel.create({
            user: user._id,
            story: url,
            fileId: fileId,
            date: new Date()
        });

        user.stories.push(newStory._id);
        await user.save();

        res.redirect('/feed');
    } catch (err) {
        console.error("Error uploading story:", err);
        res.redirect('/feed');
    }
}

/**
 * POST /story/delete/:id
 * Delete a story manually
 */
async function deleteStory(req, res) {
    try {
        const user = await userModel.findOne({ username: req.user.username });
        const story = await storyModel.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ error: "Story not found" });
        }

        if (story.user.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        if (story.fileId) {
            await deleteFromImageKit(story.fileId);
        }

        await storyModel.findByIdAndDelete(story._id);
        await userModel.updateOne(
            { _id: user._id },
            { $pull: { stories: story._id } }
        );

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({ success: true });
        }
        res.redirect('/feed');
    } catch (err) {
        console.error("Error deleting story:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    cleanExpiredStories,
    getActiveStoriesForFeed,
    uploadStory,
    deleteStory
};
