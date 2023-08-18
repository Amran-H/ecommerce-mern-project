const express = require('express');


const upload = require('../middlewares/uploadFile');

const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/auth');
const { handleCreateProduct, handleGetProducts, handleGetProduct } = require('../controllers/productController');
const { validateProduct } = require('../validators/product');

const productRouter = express.Router();

// POST --> api/products --> create a product
productRouter.post(
    "/",
    upload.single("image"),
    validateProduct,
    runValidation,
    isLoggedIn,
    isAdmin,
    handleCreateProduct
);


// GET --> api/products --> get all products
productRouter.get(
    "/",
    handleGetProducts
);


// GET --> api/products/:slug --> get single product
productRouter.get(
    "/:slug",
    handleGetProduct
);


module.exports = productRouter;