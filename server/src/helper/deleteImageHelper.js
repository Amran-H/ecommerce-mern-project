const fs = require('fs/promises');

const deleteImage = async (imagePath) => {
    try {
        console.log('delete image');
        await fs.access(imagePath);
        await fs.unlink(imagePath);
        console.log('User image was deleted');
    } catch (error) {
        console.error('User image does not exist or could not be deleted');

        throw error;
    }
};

module.exports = deleteImage;