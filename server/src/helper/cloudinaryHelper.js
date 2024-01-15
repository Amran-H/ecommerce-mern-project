const publicIdWithoutExtensionFromUrl = async (imageUrl) => {
    const pathSegments = imageUrl.split('/');

    // get the last segment
    const lastSegment = pathSegments[pathSegments.length - 1];

    const valueWithoutExtension = lastSegment.replace(".jpg", "");

    return valueWithoutExtension;
};

module.exports = publicIdWithoutExtensionFromUrl;