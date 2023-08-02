var slugify = require('slugify')
const Category = require('../models/categoryModel');

const createCategory = async (name) => {

    const newCategory = await Category.create({
        name: name,
        slug: slugify(name)
    });

    return newCategory;
};

const getCategories = async () => {
    return await Category.find({}).select('name slug').lean();
};

const getCategory = async (slug) => {
    return await Category.find({ slug }).select('name slug').lean();
};

const updateCategory = async (name, slug) => {

    const filter = { slug };
    const update = { $set: { name: name, slug: slugify(name) } };
    const option = { new: true };
    const updateCategory = await Category.findOneAndUpdate(
        filter,
        update,
        option
    );

    return updateCategory;
};

const deleteCategory = async (slug) => {
    const result = await Category.findOneAndDelete({ slug });
    return result;
};

module.exports = { createCategory, getCategories, getCategory, updateCategory, deleteCategory };