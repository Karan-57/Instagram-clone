const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    body: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }]
});

module.exports = mongoose.model("comment", commentSchema);
