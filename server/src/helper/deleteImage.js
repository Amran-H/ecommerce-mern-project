const fs = require('fs').promises;

const deleteImage = async (userImagePath) => {

    try {
        await fs.access(userImagePath)
        await fs.unlink(userImagePath)
        console.log("User image was deleted")
    } catch (error) {
        console.error("user image doesn't exist")
    }
};

module.exports = { deleteImage };