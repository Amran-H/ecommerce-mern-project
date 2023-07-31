const express = require('express');

const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/auth');
const { handleCreateCategory } = require('../controllers/categoryController');
const { validateCategory } = require('../validators/category');

const categoryRouter = express.Router();

// POST /api/categories
categoryRouter.post(
    "/",
    validateCategory,
    runValidation,
    isLoggedIn,
    isAdmin,
    handleCreateCategory
);




module.exports = categoryRouter;