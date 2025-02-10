const {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    patchCategory,
} = require('../models/categoryModel');

// Add a new category
const addNewCategory = async (req, res) => {
    const { name, logo, offer, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Category name is required and must be a valid string.' });
    }
    console.log("description is here", description);
    

    try {
        const category = { name: name.trim(), logo: logo?.trim(), offer: offer?.trim(), description: description?.trim() };
        const result = await addCategory(category);

        if (result.success) {
            return res.status(201).json({ message: result.message });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error(`Error in addNewCategory: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred while adding the category. Please try again later.' });
    }
};

// Get all categories
const getAllCategoriesController = async (req, res) => {
    try {
        const categories = await getAllCategories();
        return res.status(200).json(categories);
    } catch (error) {
        console.error(`Error in getAllCategories: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred while fetching categories. Please try again later.' });
    }
};

// Get category by ID
const getCategoryByIdController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Category ID is required.' });
    }

    try {
        const category = await getCategoryById(id);

        if (category) {
            return res.status(200).json(category);
        } else {
            return res.status(404).json({ error: 'Category not found.' });
        }
    } catch (error) {
        console.error(`Error in getCategoryById: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred while fetching the category. Please try again later.' });
    }
};

// Update category (replace entire category)
const updateCategoryController = async (req, res) => {
    const { id } = req.params;
    const { name, logo, offer } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Category ID is required.' });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Category name is required and must be a valid string.' });
    }

    try {
        const updatedCategory = { name: name.trim(), logo: logo?.trim(), offer: offer?.trim() };
        const result = await updateCategory(id, updatedCategory);

        if (result.success) {
            return res.status(200).json({ message: result.message });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error(`Error in updateCategory: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred while updating the category. Please try again later.' });
    }
};

// Patch category (update specific fields)
const patchCategoryController = async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Category ID is required.' });
    }

    try {
        const result = await patchCategory(id, updateFields);

        if (result.success) {
            return res.status(200).json({ message: result.message });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error(`Error in patchCategory: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred while updating the category. Please try again later.' });
    }
};

// Delete category
const deleteCategoryController = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'Category ID is required.' });
    }

    try {
        const result = await deleteCategory(id);

        if (result.success) {
            return res.status(200).json({ message: result.message });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error(`Error in deleteCategory: ${error.message}`);
        return res.status(500).json({ error: 'An error occurred while deleting the category. Please try again later.' });
    }
};

module.exports = {
    addNewCategory,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    patchCategoryController,
    deleteCategoryController,
};
