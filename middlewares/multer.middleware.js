const multer = require('multer');

// Use memoryStorage so file buffer is directly available for ImageKit upload
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = upload;
