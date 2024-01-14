const createError = require('http-errors');
const slugify = require("slugify");
const { successResponse } = require('./responseController');
const { createProduct, getProducts, getProductBySlug, deleteProductBySlug, updateProductBySlug } = require('../services/productService');
const cloudinary = require('../config/cloudinary');

const handleCreateProduct = async (req, res, next) => {
    try {
        let image = req.file?.path;

        if (image) {
            const response = await cloudinary.uploader.upload(image, {
                folder: 'E-commerce MERN stack/products',
            });
            image = response.secure_url;
        }

        const product = await createProduct(req.body, image)

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
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        const searchRegExp = new RegExp(".*" + search + ".*", "i");
        const filter = {
            $or: [
                { name: { $regex: searchRegExp } },
                // { email: { $regex: searchRegExp } },
            ],
        };

        const productsData = await getProducts(page, limit, filter);

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

const handleGetProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const product = await getProductBySlug(slug);

        return successResponse(res, {
            statusCode: 200,
            message: 'Returned single product',
            payload: { product }
        });
    } catch (error) {
        next(error)
    }
};

const handleDeleteProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const product = await deleteProductBySlug(slug);

        return successResponse(res, {
            statusCode: 200,
            message: 'Product deleted Successfully',
        });
    } catch (error) {
        next(error)
    }
};

const handleUpdateProduct = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const updateOptions = { new: true, runValidators: true, context: 'query' };
        let updates = {};

        // if (req.body.name) {
        //     updates.name = req.body.name;
        // }
        //can take every field separately as shown above 

        const allowedFields = [
            'name',
            'description',
            'price',
            'quantity',
            'sold',
            'shipping'
        ];

        for (const key in req.body) {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
            // else if (key == 'email') {
            //     throw createError(400, 'Email cannot be updated');
            // }
        }

        const image = req.file?.path;

        const updatedProduct = await updateProductBySlug(slug, updates, image, updateOptions)

        return successResponse(res, {
            statusCode: 200,
            message: "Product was updated successfully",
            payload: updatedProduct,
        });
    } catch (error) {
        next(error)
    }
};

module.exports = {
    handleCreateProduct,
    handleGetProducts,
    handleGetProduct,
    handleDeleteProduct,
    handleUpdateProduct
};
