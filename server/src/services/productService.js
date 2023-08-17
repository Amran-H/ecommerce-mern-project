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



module.exports = {
    createProduct
};