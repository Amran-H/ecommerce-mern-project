const createError = require('http-errors');
const mongoose = require('mongoose');

const User = require('../models/userModel');
const deleteImage = require('../helper/deleteImageHelper');

const findUsers = async (search, limit, page) => {
    try {
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

        if (!users || users.length == 0) throw createError(404, "No user found!");

        return {
            users,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page - 1 > 0 ? page - 1 : null,
                nextPage: page + 1 <= Math.ceil(count / limit) ? page + 1 : null,
            },
        };
    } catch (error) {
        throw error;
    }
}

const findUserById = async (id, options = {}) => {
    try {
        const user = await User.findById(id, options);
        if (!user) throw createError(404, 'User not found');
        return user;
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(400, 'Invalid Id');
        }
        throw error;
    }
};

const deleteUserById = async (id, options = {}) => {
    try {
        const user = await User.findByIdAndDelete({
            _id: id,
            isAdmin: false
        });

        // if (user && user?.image) {
        //     await deleteImage(user.image);
        // }
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(400, 'Invalid Id');
        }
        throw error;
    }
};

const updateUserById = async (userId, req) => {
    try {
        const options = { password: 0 };
        // find the user
        const user = await findUserById(userId, options);

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
            throw createError(404, 'User with this ID does not exist');
        };
        return updatedUser;
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(400, 'Invalid Id');
        }
        throw error;
    }
};

const handleUserAction = async (userId, action) => {
    try {
        let update;
        let successMessage;
        if (action === 'ban') {
            update = { isBanned: true };
            successMessage = "User was banned successfully";
        } else if (action === 'unban') {
            update = { isBanned: false };
            successMessage = "User was unbanned successfully";
        } else {
            throw createError(400, 'Invalid action. Use ban or unban');
        }

        const updateOptions = { new: true, runValidators: true, context: 'query' };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            update,
            updateOptions
        ).select("-password");

        if (!updatedUser) {
            throw createError(400, 'User was not banned successfully');
        }
        return successMessage;
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            throw createError(400, 'Invalid Id');
        }
        throw (error);
    }
}

module.exports = { handleUserAction, findUsers, findUserById, deleteUserById, updateUserById };