const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/userModel');
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
// const { deleteImage } = require('../helper/deleteImage');
const { createJSONWebToken } = require('../helper/jsonwebtoken');
const { jwtActivationKey, clientURL, jwtResetPasswordKey } = require('../secret');
const { MAX_FILE_SIZE } = require('../config');
const checkUserExists = require('../helper/checkUserExists');
const sendEmail = require('../helper/sendEmail');
const deleteImage = require('../helper/deleteImageHelper');
const cloudinary = require('../config/cloudinary');

const handleGetUsers = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;

        const searchRegExp = new RegExp(".*" + search + ".*", "i");
        const filter = {
            isAdmin: { $ne: true },
            $or: [
                { name: { $regex: searchRegExp } },
                { email: { $regex: searchRegExp } },
                { phone: { $regex: searchRegExp } },
            ],
        };
        const options = { password: 0 }

        const users = await User.find(filter, options)
            .limit(limit)
            .skip((page - 1) * limit);

        const count = await User.find(filter).countDocuments();

        if (!users || users.length == 0) throw createError(404, "No user found!")

        return successResponse(res, {
            statusCode: 200,
            message: "Users were returned successfully",
            payload: {
                users,
                pagination: {
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                    previousPage: page - 1 > 0 ? page - 1 : null,
                    nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
                },
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
        const user = await findWithId(User, id, options);
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
        const user = await findWithId(User, id, options);

        await User.findByIdAndDelete({
            _id: id,
            isAdmin: false
        });

        if (user && user?.image) {
            await deleteImage(user.image);
        }

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
                    folder: 'E-commerce MERN stack',
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
        const options = { password: 0 };
        // find the user
        const user = await findWithId(User, userId, options);

        console.log(user);

        const updateOptions = { new: true, runValidators: true, context: 'query' };
        let updates = {};

        // if (req.body.name) {
        //     updates.name = req.body.name;
        // }
        //can take every field separately as shown above 

        const allowedFields = ['name', 'password', 'address', 'phone'];
        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
            else if (key == 'email') {
                throw createError(400, 'Email cannot be updated');
            }
        }

        const image = req.file?.path;
        if (image) {
            if (image.size > MAX_FILE_SIZE) {
                throw new Error(400, 'File is too large! Must be less than 2 MB');
            }
            updates.image = image;
            user.image !== 'default.jpg' && deleteImage(user.image);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            updateOptions
        ).select("-password");

        if (!updatedUser) {
            throw createError(400, 'User with this ID does not exist');
        }

        return successResponse(res, {
            statusCode: 200,
            message: "User was updated successfully",
            payload: updatedUser,
        });
    } catch (error) {
        next(error)
    }
};

const handleBanUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        await findWithId(User, userId);
        const updates = { isBanned: true };
        const updateOptions = { new: true, runValidators: true, context: 'query' };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            updateOptions
        ).select("-password");

        if (!updatedUser) {
            throw createError(400, 'User was not banned successfully');
        }

        return successResponse(res, {
            statusCode: 200,
            message: "User was banned successfully",
        });
    } catch (error) {
        next(error)
    }
};


const handleUnbanUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;
        await findWithId(User, userId);
        const updates = { isBanned: false };
        const updateOptions = { new: true, runValidators: true, context: 'query' };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            updateOptions
        ).select("-password");

        if (!updatedUser) {
            throw createError(400, 'User was not Unbanned successfully');
        }

        return successResponse(res, {
            statusCode: 200,
            message: "User was Unbanned successfully",
        });
    } catch (error) {
        next(error)
    }
};


const handleUpdatePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.params.id;
        const user = await findWithId(User, userId);

        // compare the password
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            throw createError(
                400,
                "Old password is incorrect"
            );
        };

        // const filter = { userId };
        // const updates = { $set: { password: newPassword } }
        // const updateOptions = { new: true }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: newPassword },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            throw createError(400, 'User password was not Updated successfully');
        }

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
        const userData = await User.findOne({ email: email });
        if (!userData) {
            throw createError(404, 'Email is incorrect or you have not verified your email address. Please register first');
        }

        // create jwt
        const token = createJSONWebToken({
            email
        },
            jwtResetPasswordKey,
            "10m");

        // prepare email
        const emailData = {
            email,
            subject: "Password reset email",
            html: `
            <h2> Hello ${userData.name}! </h2>
            <p> Please click here to  <a href="${clientURL}/api/users/reset-password/${token}" target="_blank">reset your password</a>  </p>
            `,
        };

        // send email with nodemailer
        sendEmail(emailData)

        return successResponse(res, {
            statusCode: 200,
            message: `Please go to your ${email} to reset the password`,
            payload: { token }
        });
    } catch (error) {
        next(error)
    }
};

const handleResetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const decoded = jwt.verify(token, jwtResetPasswordKey);
        if (!decoded) {
            throw createError(400, 'Invalid or expired token')
        };
        const filter = { email: decoded.email };
        const update = { password: password };
        const options = { new: true };

        const updatedUser = await User.findOneAndUpdate(
            filter,
            update,
            options
        ).select("-password");

        if (!updatedUser) {
            throw createError(400, 'Password reset fail');
        }

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
    handleBanUserById,
    handleUnbanUserById,
    handleUpdatePassword,
    handleForgetPassword,
    handleResetPassword
};
