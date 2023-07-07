require("dotenv").config();

const serverPort = process.env.SERVER_PORT || 3002;

const mongodbURL = process.env.MONGODB_URL;

const defaultImagePath = process.env.DEFAULT_USER_IMAGE_PATH || "public/images/users/usericon.png";

const jwtActivationKey = process.env.JWT_ACTIVATION_KEY;

const jwtAccessKey = process.env.JWT_ACCESS_KEY;

const smtpUsername = process.env.SMTP_USERNAME;

const smtpPassword = process.env.SMTP_PASSWORD;

const clientURL = process.env.CLIENT_URL;




module.exports = { serverPort, mongodbURL, defaultImagePath, jwtActivationKey, smtpUsername, smtpPassword, clientURL, jwtAccessKey };