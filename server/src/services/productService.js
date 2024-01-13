var slugify = require('slugify');
var createError = require('http-errors');
const Product = require('../models/productModel');

const createProduct = async (productData, image) => {
    if (image && image.size > 1024 * 1024 * 2) {
        throw createError(400, 'File is too large! Must be less than 2 MB');
    };
    if (image) {
        productData.image = image;
    };

    const productExists = await Product.exists({ name: productData.name });
    if (productExists) {
        throw createError(409, "Product with this name already exists.")
    };
    // create product
    const product = await Product.create({ ...productData, slug: slugify(productData.name) });

    return product;
};


const getProducts = async (page = 1, limit = 4, filter = {}) => {

    const products = await Product.find(filter)
        .populate('category')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    if (!products) throw createError(404, 'Mo products found')

    const count = await Product.find(filter).countDocuments();

    return {
        products,
        count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
    };

};


const getProductBySlug = async (slug) => {

    const product = await Product.find({ slug })
        .populate('category')

    if (!product) throw createError(404, 'No products found')

    return {
        product,
    };

};

const deleteProductBySlug = async (slug) => {

    const deleteProduct = await Product.findOneAndDelete({ slug });

    if (!deleteProduct) throw createError(404, 'Mo product found')

    return {
        deleteProduct,
    };

};

const updateProductBySlug = async (slug, updates, image, updateOptions) => {

    if (updates.name) {
        updates.slug = slugify(updates.name)
    }

    if (image) {
        if (image.size > MAX_FILE_SIZE) {
            throw createError(400, 'File is too large! Must be less than 2 MB');
        }
        updates.image = image.buffer.toString('base64');
    }

    const updatedProduct = await Product.findOneAndUpdate(
        { slug },
        updates,
        updateOptions
    );

    if (!updatedProduct) {
        throw createError(400, 'Product with this slug does not exist');
    }
    return updatedProduct;

};

module.exports = {
    createProduct,
    getProducts,
    getProductBySlug,
    deleteProductBySlug,
    updateProductBySlug
};