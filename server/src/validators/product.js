const { body } = require('express-validator');

const validateProduct = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage(" Product Name is required")
        .isLength({ min: 3, max: 150 })
        .withMessage("Product Name should be 3-150 characters"),
    body("description")
        .trim()
        .notEmpty()
        .withMessage(" description Name is required")
        .isLength({ min: 3 })
        .withMessage("Product Name should be 3  characters"),
    body("price")
        .trim()
        .notEmpty()
        .withMessage(" price Name is required")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    body("category")
        .trim()
        .notEmpty()
        .withMessage(" category is required"),
    body("quantity")
        .trim()
        .notEmpty()
        .withMessage(" quantity is required")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer"),
];

module.exports = {
    validateProduct,
};