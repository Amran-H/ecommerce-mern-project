const createError = require('http-errors');
const slugify = require("slugify");
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
const Product = require('../models/productModel');
const { MAX_FILE_SIZE } = require('../config');


const handleCreateProduct = async (req, res, next) => {
    try {
        const { name, description, price, quantity, shipping, category } = req.body;
        const image = req.file;

        if (!image) {
            throw createError(400, 'Image is required');
        }

        if (image.size > MAX_FILE_SIZE) {
            throw createError(400, 'File is too large! Must be less than 2 MB');
        }

        const imageBufferString = image.buffer.toString('base64');

        const productExists = await Product.exists({ name: name });
        if (productExists) {
            throw createError(409, "Product with this name already exists.")
        };
        // create product
        const product = await Product.create({
            name: name,
            slug: slugify(name),
            description: description,
            price: price,
            quantity: quantity,
            shipping: shipping,
            image: imageBufferString,
            category: category
        })

        return successResponse(res, {
            statusCode: 200,
            message: 'Product  was created successfully',
            payload: { product }
        });
    } catch (error) {
        next(error)
    }
};


module.exports = {
    handleCreateProduct
};
