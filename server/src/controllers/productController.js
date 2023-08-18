const createError = require('http-errors');
const slugify = require("slugify");
const { successResponse } = require('./responseController');
const { findWithId } = require('../services/findItem');
const Product = require('../models/productModel');
const { MAX_FILE_SIZE } = require('../config');
const { createProduct, getProducts } = require('../services/productService');


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

        const productData = {
            name, description, price, quantity, shipping, category, imageBufferString
        }

        const product = await createProduct(productData)

        return successResponse(res, {
            statusCode: 200,
            message: 'Product  was created successfully',
            payload: product
        });
    } catch (error) {
        next(error)
    }
};


const handleGetProducts = async (req, res, next) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        const productsData = await getProducts(page, limit);

        return successResponse(res, {
            statusCode: 200,
            message: 'Returned all the products',
            payload: {
                products: productsData.products,
                pagination: {
                    totalPages: productsData.totalPages,
                    currentPage: productsData.currentPage,
                    previousPage: productsData.currentPage - 1,
                    nextPage: productsData.currentPage + 1,
                    totalNumberOfProducts: productsData.count,

                }
            }
        });
    } catch (error) {
        next(error)
    }
};


module.exports = {
    handleCreateProduct,
    handleGetProducts
};
