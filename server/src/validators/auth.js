const { body } = require('express-validator');
// Registration validation
const validateUserRegistration = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 31 })
        .withMessage("Name should be 3-31 characters"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("invalid email"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("password is required")
        .isLength({ min: 6 })
        .withMessage("Password should be 6 characters long")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%?&*])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage("Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."),

    body("address")
        .trim()
        .notEmpty()
        .withMessage("address is required")
        .isLength({ min: 3 })
        .withMessage("address should be 3 characters long"),
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("phone is required"),
    body("image")
        .custom((value, { req }) => {
            if (!req.file || !req.file.buffer) {
                throw new Error('User image is required');
            }
            return true;
        })
        .withMessage("User Image is required"),
];


const validateUserLogin = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("invalid email"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("password is required")
        .isLength({ min: 6 })
        .withMessage("Password should be 6 characters long")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%?&*])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage("Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
];


const validateUserPasswordUpdate = [


    body("oldPassword")
        .trim()
        .notEmpty()
        .withMessage("Old password is required")
        .isLength({ min: 6 })
        .withMessage("Password should be 6 characters long")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%?&*])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage("Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
    body("newPassword")
        .trim()
        .notEmpty()
        .withMessage("Old password is required")
        .isLength({ min: 6 })
        .withMessage("New password should be 6 characters long")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%?&*])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage("New password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."),

    body('confirmedPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) {
            throw new Error("Password did not match")
        }
        return true;
    })
];

const validateUserForgetPassword = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage("invalid email"),

];

const validateUserResetPassword = [

    body("token")
        .trim()
        .notEmpty()
        .withMessage("token is missing."),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("password is required")
        .isLength({ min: 6 })
        .withMessage("Password should be 6 characters long")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%?&*])[A-Za-z\d@$!%*?&]+$/
        )
        .withMessage("Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character."),

];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateUserPasswordUpdate,
    validateUserForgetPassword,
    validateUserResetPassword
};