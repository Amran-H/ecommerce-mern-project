var slugify = require('slugify');
var createError = require('http-errors');
const Product = require('../models/productModel');

const createProduct = async (productData) => {
    const { name, description, price, quantity, shipping, category, imageBufferString } = productData;

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

    return product;
};


const getProducts = async (page = 1, limit = 4) => {

    const products = await Product.find({})
        .populate('category')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    if (!products) throw createError(404, 'Mo products found')

    const count = await Product.find({}).countDocuments();

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

    if (!product) throw createError(404, 'Mo products found')

    return {
        product,
    };

};



module.exports = {
    createProduct,
    getProducts,
    getProductBySlug
};