const express = require('express');


const upload = require('../middlewares/uploadFile');

const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/auth');
const { handleCreateProduct } = require('../controllers/productController');
const { validateProduct } = require('../validators/product');

const productRouter = express.Router();

// POST: api/products
productRouter.post(
    "/",
    upload.single("image"),
    validateProduct,
    runValidation,
    isLoggedIn,
    isAdmin,
    handleCreateProduct
);


module.exports = productRouter;