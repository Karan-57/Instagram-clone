const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

/**
 * Upload a file buffer to ImageKit
 * @param {Buffer} fileBuffer - The file buffer from multer (file.buffer)
 * @param {string} fileName - File name to save as
 * @param {string} folder - ImageKit folder path (e.g. 'instaclone/posts' or 'instaclone/pfp')
 * @returns {Promise<string>} - The uploaded file URL
 */
async function uploadToImageKit(fileBuffer, fileName, folder = 'instaclone') {
    const response = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: folder
    });

    return response.url;
}

module.exports = {
    imagekit,
    uploadToImageKit
};
