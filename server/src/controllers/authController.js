const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { successResponse } = require('./responseController');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtAccessKey } = require('../secret');

const handleLogin = async (req, res, next) => {
    try {
        // email, password
        const { email, password } = req.body;

        // isExist
        const user = await User.findOne({ email });
        if (!user) {
            throw createError(
                404,
                "User does not exist with this email. Please register first."
            );
        };

        // compare the password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw createError(
                401,
                "Email/Password did not match"
            );
        };

        // isBanned
        if (user.isBanned) {
            throw createError(
                403,
                "You are banned. Please contact authority."
            );
        };

        // token, cookie
        const accessToken = createJSONWebToken({ email },
            jwtAccessKey,
            "10m");
        res.cookie('access_token', accessToken, {
            maxAge: 15 * 60 * 1000, // 15 minutes
            httpOnly: true,
            // secure: true,
            samSite: 'none'
        });

        // success response 
        return successResponse(res, {
            statusCode: 200,
            message: "User was logged In successfully",
            payload: { user },
        });
    } catch (error) {
        next(error);
    }
};


const handleLogout = async (req, res, next) => {
    try {
        res.clearCookie('access_token');

        // success response 
        return successResponse(res, {
            statusCode: 200,
            message: "User was logged Out successfully",
            payload: {},
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { handleLogin, handleLogout };