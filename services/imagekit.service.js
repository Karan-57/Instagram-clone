require('dotenv').config();
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

/**
 * Upload a story file buffer to ImageKit inside 'instaclone/stories'
 * @param {Buffer} fileBuffer - The file buffer from multer (file.buffer)
 * @param {string} fileName - File name to save as
 * @returns {Promise<{ url: string, fileId: string }>} - The uploaded file URL and fileId
 */
async function uploadStoryToImageKit(fileBuffer, fileName) {
    const response = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: 'instaclone/stories'
    });

    return {
        url: response.url,
        fileId: response.fileId
    };
}

/**
 * Delete a file from ImageKit by fileId
 * @param {string} fileId - The ImageKit fileId
 */
async function deleteFromImageKit(fileId) {
    if (!fileId) return;
    try {
        await imagekit.deleteFile(fileId);
        console.log(`Deleted file ${fileId} from ImageKit`);
    } catch (err) {
        console.error(`Failed to delete file ${fileId} from ImageKit:`, err.message);
    }
}

module.exports = {
    imagekit,
    uploadToImageKit,
    uploadStoryToImageKit,
    deleteFromImageKit
};
