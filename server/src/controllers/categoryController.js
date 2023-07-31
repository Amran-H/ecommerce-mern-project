var slugify = require('slugify')
const { successResponse } = require("./responseController");
const Category = require('../models/categoryModel');
const { createCategory } = require('../services/categoryService');

const handleCreateCategory = async (req, res, next) => {
    try {
        const { name } = req.body;

        await createCategory(name);

        return successResponse(res, {
            statusCode: 200,
            message: 'Category was created successfully',
        });
    } catch (error) {
        next(error)
    }
};

module.exports = { handleCreateCategory };