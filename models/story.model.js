const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    story: {
        type: String,
        required: true
    },
    fileId: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours TTL index in MongoDB
    }
});

module.exports = mongoose.model("story", storySchema);
