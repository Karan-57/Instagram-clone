const { userModel } = require('../models');

async function getProfile(req, res) {
    const user = await userModel.findOne({ username: req.user.username }).populate('posts');
    res.render("profile", { footer: true, user });
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
        user.profileImage = req.file.filename;
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
    res.render("userprofile", { footer: true, user: null });
}

module.exports = {
    getProfile,
    getEditPage,
    updateProfile,
    getSearchPage,
    getUserByUsername,
    getUserProfilePage
};
