const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    name: String,
    email: String,
    password: String,
    profileImage: String,
    bio: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }],
    stories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'story'
    }]
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
