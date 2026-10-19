const mongoose = require('mongoose');

function connectDB() {
    let mongoURI = process.env.MONGO_URI || "mongodb+srv://test:test@express2.ivrlo1x.mongodb.net/instaclone?retryWrites=true&w=majority";

    // Ensure database name is explicitly set to /instaclone if base cluster URI is provided
    const options = {
        dbName: 'instaclone'
    };

    mongoose.connect(mongoURI, options)
        .then(() => {
            console.log(`Connected to MongoDB successfully (Database: ${mongoose.connection.name})`);
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err.message);
            process.exit(1);
        });
}

module.exports = connectDB;
