const createError = require('http-errors');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const { successResponse } = require('./responseController');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtActivationKey, clientURL, jwtResetPasswordKey } = require('../secret');
const checkUserExists = require('../helper/checkUserExists');
const sendEmail = require('../helper/sendEmail');
const cloudinary = require('../config/cloudinary');
const {
    handleUserAction,
    findUsers,
    findUserById,
    deleteUserById,
    updateUserById,
    updatePasswordById,
    forgetPasswordByEmail,
    resetPassword,
} = require('../services/userService');

const handleGetUsers = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const { users, pagination } = await findUsers(search, limit, page);

        return successResponse(res, {
            statusCode: 200,
            message: "Users were returned successfully",
            payload: {
                users: users,
                pagination: pagination,
            },
        });
    } catch (error) {
        next(error)
    }
};

const handleGetUserById = async (req, res, next) => {
    try {
        console.log(req.user);
        const id = req.params.id;
        const options = { password: 0 };
        const user = await findUserById(id, options);
        return successResponse(res, {
            statusCode: 200,
            message: "User was returned successfully",
            payload: {
                user
            },
        });
    } catch (error) {
        next(error)
    }
};

const handleDeleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const options = { password: 0 };
        await deleteUserById(id, options);
        return successResponse(res, {
            statusCode: 200,
            message: "User was deleted successfully",
        });
    } catch (error) {
        next(error)
    }
};

const handleProcessRegister = async (req, res, next) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const image = req.file?.path;
        if (image && image.size > 1024 * 1024 * 2) {
            throw createError(400, 'File is too large! Must be less than 2 MB');
        };

        const userExists = await checkUserExists(email)
        if (userExists) {
            throw createError(409, "User with this email already exists. Please login")
        };

        // create jwt
        const tokenPayload = {
            name,
            email,
            password,
            phone,
            address,
        };

        if (image) {
            tokenPayload.image = image;
        }

        const token = createJSONWebToken(tokenPayload,
            jwtActivationKey,
            "10m");

        // prepare email
        const emailData = {
            email,
            subject: "Account activation email",
            html: `
            <h2> Hello ${name}! </h2>
            <p> Please click here to  <a href="${clientURL}/api/users/activate/${token}" target="_blank">activate your account</a>  </p>
            `,
        };

        // send email with nodemailer
        sendEmail(emailData)
        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} for completing your registration process`,
            payload: token
        });
    } catch (error) {
        next(error)
    }
};


const handleActivateUserAccount = async (req, res, next) => {
    try {
        const token = req.body.token;
        if (!token) throw createError(404, "Token not found");

        try {
            const decoded = jwt.verify(token, jwtActivationKey);
            if (!decoded) throw createError(401, "Unable to verify user!");

            const userExists = await User.exists({ email: decoded.email })
            if (userExists) {
                throw createError(409, "User with this email already exists. Please login")
            };

            const image = decoded.image;
            if (image) {
                const response = await cloudinary.uploader.upload(image, {
                    folder: 'E-commerce MERN stack/users',
                });
                decoded.image = response.secure_url;
            }

            await User.create(decoded);

            return successResponse(res, {
                statusCode: 201,
                message: "User was registered successfully"
            });
        } catch (error) {
            if (error.name == 'TokenExpiredError') {
                throw createError(401, 'Token has expired');
            } else if (error.name == 'JsonWebTokenError') {
                throw createError(401, 'invalid Token');
            } else {
                throw error;
            }
        }
    } catch (error) {
        next(error)
    }
};

const handleUpdateUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const updatedUser = await updateUserById(userId, req);
        return successResponse(res, {
            statusCode: 200,
            message: "User was updated successfully",
            payload: updatedUser,
        });
    } catch (error) {
        next(error)
    }
};

const handleManageUserStatusById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const action = req.body.action;

        const successMessage = await handleUserAction(userId, action);

        return successResponse(res, {
            statusCode: 200,
            message: successMessage,
        });
    } catch (error) {
        next(error)
    }
};

const handleUpdatePassword = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword, confirmedPassword } = req.body;
        const userId = req.params.id;

        const updatedUser = await updatePasswordById(userId, email, oldPassword, newPassword, confirmedPassword)

        return successResponse(res, {
            statusCode: 200,
            message: "User password was Updated successfully",
            payload: { updatedUser }
        });
    } catch (error) {
        next(error)
    }
};

const handleForgetPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const token = await forgetPasswordByEmail(email)

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} to reset the password`,
            payload: token
        });
    } catch (error) {
        next(error)
    }
};

const handleResetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        await resetPassword(token, password)

        return successResponse(res, {
            statusCode: 200,
            message: "User password reset successfully",
        });
    } catch (error) {
        next(error)
    }
};

module.exports = {
    handleGetUsers,
    handleGetUserById,
    handleDeleteUserById,
    handleProcessRegister,
    handleActivateUserAccount,
    handleUpdateUserById,
    handleManageUserStatusById,
    handleUpdatePassword,
    handleForgetPassword,
    handleResetPassword
};
