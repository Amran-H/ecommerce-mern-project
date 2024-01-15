const createError = require('http-errors');
const slugify = require("slugify");
const { successResponse } = require('./responseController');
const { createProduct, getProducts, getProductBySlug, deleteProductBySlug, updateProductBySlug } = require('../services/productService');

const handleCreateProduct = async (req, res, next) => {
    try {
        const image = req.file?.path;

        const product = await createProduct(req.body, image)

        return successResponse(res, {
            statusCode: 200,
            message: 'Product created successfully',
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

        await deleteProductBySlug(slug);

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
        const updatedProduct = await updateProductBySlug(slug, req);
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
