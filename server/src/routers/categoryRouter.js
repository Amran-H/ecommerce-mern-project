const express = require('express');

const runValidation = require('../validators');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../middlewares/auth');
const { handleCreateCategory, handleGetCategories, handleGetCategory, handleUpdateCategory, handleDeleteCategory } = require('../controllers/categoryController');
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

// GET /api/categories
categoryRouter.get("/", handleGetCategories);
categoryRouter.get("/:slug", handleGetCategory);
categoryRouter.put(
    "/:slug",
    validateCategory,
    runValidation,
    isLoggedIn,
    isAdmin,
    handleUpdateCategory
);
categoryRouter.delete(
    "/:slug",
    isLoggedIn,
    isAdmin,
    handleDeleteCategory
);

module.exports = categoryRouter;