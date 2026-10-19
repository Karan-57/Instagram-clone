const { userModel, postModel, commentModel } = require('../models');
const { uploadToImageKit } = require('../services/imagekit.service');

async function getFeed(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    const posts = await postModel.find().populate('user');
    res.render("feed", { posts, user });
}

async function getUploadPage(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    res.render("upload", { footer: true, user });
}

async function createPost(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    
    let imageUrl = '';
    if (req.file) {
        const fileName = `post_${Date.now()}_${req.file.originalname}`;
        imageUrl = await uploadToImageKit(req.file.buffer, fileName, 'instaclone/posts');
    }

    const post = await postModel.create({
        picture: imageUrl,
        caption: req.body.caption,
        user: user._id
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect('/feed');
}

async function likePost(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.findOne({ _id: req.params.id });
    if (post.likes.indexOf(user._id) === -1) {
        post.likes.push(user);
    } else {
        post.likes.splice(post.likes.indexOf(user._id), 1);
    }
    await post.save();
    res.redirect('/feed');
}

async function getComments(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.findOne({ _id: req.params.id }).populate({
        path: 'comments',
        populate: { path: 'user' }
    });
    res.render("comments", { post, user });
}

async function addComment(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    const post = await postModel.findOne({ _id: req.params.id });
    const comment = await commentModel.create({
        body: req.body.body,
        user
    });
    post.comments.push(comment._id);
    await post.save();
    res.redirect(`/comments/${req.params.id}`);
}

async function likeComment(req, res) {
    const user = await userModel.findOne({ username: req.user.username });
    const comment = await commentModel.findOne({ _id: req.params.id });
    if (comment.likes.indexOf(user._id) === -1) {
        comment.likes.push(user._id);
    } else {
        comment.likes.splice(comment.likes.indexOf(user._id), 1);
    }
    await comment.save();
    res.redirect(`/comments/${req.params.postId}`);
}

module.exports = {
    getFeed,
    getUploadPage,
    createPost,
    likePost,
    getComments,
    addComment,
    likeComment
};
