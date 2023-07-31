const mongoose = require('mongoose');
const { mongodbURL } = require('../secret');
const logger = require('../controllers/loggerController');

const connectDB = async (options = {}) => {
    try {
        await mongoose.connect(mongodbURL, options);
        logger.log('info', "connection mongodb is successful");
        mongoose.connection.on("error", (error) => {
            logger.log('error', "DB connection error:", error);
        });
    } catch (error) {
        logger.log('error', "Could not connect to db:", error.toString());
    }
}

module.exports = { connectDB };