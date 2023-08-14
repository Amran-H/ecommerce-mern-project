const express = require('express');


const upload = require('../middlewares/uploadFile');

const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/auth');
const { handleCreateProduct } = require('../controllers/productController');

const productRouter = express.Router();

// POST: api/products
productRouter.post(
    "/",
    upload.single("image"),
    handleCreateProduct
);


module.exports = productRouter;