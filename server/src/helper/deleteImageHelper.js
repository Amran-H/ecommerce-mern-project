const fs = require('fs/promises');

const deleteImage = async (imagePath) => {
    try {
        await fs.access(imagePath);
        await fs.unlink(imagePath);
        console.log('Image was deleted');
    } catch (error) {
        console.error('Image does not exist or could not be deleted');

        throw error;
    }
};

module.exports = deleteImage;