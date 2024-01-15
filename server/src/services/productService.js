var slugify = require('slugify');
var createError = require('http-errors');

const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');
const publicIdWithoutExtensionFromUrl = require('../helper/cloudinaryHelper');

const createProduct = async (productData, image) => {
    if (image && image.size > 1024 * 1024 * 2) {
        throw createError(400, 'File is too large! Must be less than 2 MB');
    };
    if (image) {
        const response = await cloudinary.uploader.upload(image, {
            folder: 'E-commerce MERN stack/products',
        });
        productData.image = response.secure_url;
    }

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
    try {
        const existingProduct = await Product.findOneAndDelete({ slug });

        if (!existingProduct) throw createError(404, 'No product found');
        if (existingProduct?.image) {
            const publicId = await publicIdWithoutExtensionFromUrl(
                existingProduct.image
            );
            const { result } = await cloudinary.uploader.destroy(
                `E-commerce MERN stack/products/${publicId}`
            );
            if (result !== 'ok') {
                throw new Error(
                    'Product image was not deleted successfully, Please try again'
                );
            }
        }
        await Product.findOneAndDelete({ slug });
    } catch (error) {
        throw error;
    }
};

const updateProductBySlug = async (slug, req) => {
    try {
        const product = await Product.findOne({ slug: slug });

        if (!product) {
            throw createError(404, 'No product found');
        }

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
                if (key === 'name') {
                    updates.slug = slugify(req.body[key])
                };
                updates[key] = req.body[key];
            }
        }

        const image = req.file?.path;
        if (image) {
            if (image.size > MAX_FILE_SIZE) {
                throw new Error(400, 'File is too large! Must be less than 2 MB');
            }
            updates.image = image;
            product.image !== 'default.jpg' && deleteImage(product.image);
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { slug },
            updates,
            updateOptions
        );

        if (!updatedProduct) {
            throw createError(400, 'Product update was not successful');
        }
        return updatedProduct;
    } catch (error) {
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductBySlug,
    deleteProductBySlug,
    updateProductBySlug
};