const { userModel } = require('../models');
const { uploadToImageKit } = require('../services/imagekit.service');

async function getProfile(req, res) {
    const user = await userModel.findOne({ username: req.user.username })
        .populate('posts')
        .populate('followers')
        .populate('following');
    res.render("profile", { footer: true, user });
}

async function getUserProfileById(req, res) {
    try {
        const currentUser = await userModel.findOne({ username: req.user.username });
        if (!currentUser) return res.redirect('/login');

        const targetId = req.params.id;

        // If user is viewing their own profile, redirect to /profile
        if (currentUser._id.toString() === targetId) {
            return res.redirect('/profile');
        }

        const targetUser = await userModel.findById(targetId)
            .populate('posts')
            .populate('followers')
            .populate('following');

        if (!targetUser) {
            return res.redirect('/feed');
        }

        const isFollowing = (targetUser.followers || []).some(
            u => (u._id || u).toString() === currentUser._id.toString()
        );

        res.render("userprofile", {
            footer: true,
            user: currentUser,
            targetUser,
            isFollowing
        });
    } catch (err) {
        console.error("Error in getUserProfileById:", err);
        res.redirect('/feed');
    }
}

async function followUser(req, res) {
    try {
        const currentUser = await userModel.findOne({ username: req.user.username });
        const targetUser = await userModel.findById(req.params.id);

        if (!currentUser || !targetUser) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.redirect('/feed');
        }

        if (currentUser._id.toString() === targetUser._id.toString()) {
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(400).json({ error: "Cannot follow yourself" });
            }
            return res.redirect('/profile');
        }

        if (!currentUser.following) currentUser.following = [];
        if (!targetUser.followers) targetUser.followers = [];

        const followingIndex = currentUser.following.findIndex(
            id => id.toString() === targetUser._id.toString()
        );
        const followerIndex = targetUser.followers.findIndex(
            id => id.toString() === currentUser._id.toString()
        );

        let isFollowing = false;

        if (followingIndex === -1) {
            // Follow
            currentUser.following.push(targetUser._id);
            targetUser.followers.push(currentUser._id);
            isFollowing = true;
        } else {
            // Unfollow
            currentUser.following.splice(followingIndex, 1);
            if (followerIndex !== -1) {
                targetUser.followers.splice(followerIndex, 1);
            }
            isFollowing = false;
        }

        await currentUser.save();
        await targetUser.save();

        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                isFollowing,
                followersCount: targetUser.followers.length,
                followingCount: targetUser.following.length
            });
        }

        res.redirect(`/profile/${targetUser._id}`);
    } catch (err) {
        console.error("Error in followUser:", err);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(500).json({ error: "Server error" });
        }
        res.redirect('/feed');
    }
}

async function getEditPage(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    res.render("edit", { footer: true, user });
}

async function updateProfile(req, res) {
    const user = await userModel.findOneAndUpdate(
        { username: req.session.passport.user },
        { username: req.body.username, name: req.body.name, bio: req.body.bio },
        { new: true }
    );
    if (req.file) {
        const fileName = `pfp_${Date.now()}_${req.file.originalname}`;
        const imageUrl = await uploadToImageKit(req.file.buffer, fileName, 'instaclone/pfp');
        user.profileImage = imageUrl;
    }
    await user.save();
    res.redirect('/profile');
}

async function getSearchPage(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    res.render("search", { footer: true, user });
}

async function getUserByUsername(req, res) {
    const regex = new RegExp(`^${req.params.username}`, 'i');
    const users = await userModel.find({ username: regex });
    res.json(users);
}

function getUserProfilePage(req, res) {
    res.redirect('/profile');
}

module.exports = {
    getProfile,
    getUserProfileById,
    followUser,
    getEditPage,
    updateProfile,
    getSearchPage,
    getUserByUsername,
    getUserProfilePage
};
