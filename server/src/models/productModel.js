const { Schema, model } = require("mongoose");
const { defaultImagePath } = require("../secret");

const productSchema = new Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        minlength: [3, "Product name can be minimum 3 characters"],
        maxlength: [150, "Product name can be maximum 150 characters"],
    },
    slug: {
        type: String,
        required: [true, "Product slug  is required"],
        lowercase: true,
        unique: true,
    },
    description: {
        type: String,
        required: [true, "Product description  is required"],
        trim: true,
        unique: true,
        minlength: [3, "Product description should be minimum 3 characters"],
    },
    price: {
        type: Number,
        required: [true, "Product price  is required"],
        trim: true,
        validate: {
            validator: (v) => v > 0,
            message: (props) =>
                `${props.value} is not a valid price! Price must be greater then 0`
        },
    },

    quantity: {
        type: Number,
        required: [true, "Product quantity  is required"],
        trim: true,
        validate: {
            validator: (v) => v > 0,
            message: (props) =>
                `${props.value} is not a valid quantity! quantity must be greater then 0`
        },
    },
    sold: {
        type: Number,
        required: [true, "sold quantity  is required"],
        trim: true,
        default: 0,
        // validate: {
        //     validator: (v) => v > 0,
        //     message: (props) =>
        //         `${props.value} is not a valid sold quantity! sold quantity must be greater then 0`
        // },
    },

    shipping: {
        type: Number,
        default: 0, //shipping free 0 or paid something amount

    },
    image: {
        type: String,
        default: defaultImagePath,
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    }
},
    { timestamps: true }
);

const Product = model("Product", productSchema)
module.exports = Product;