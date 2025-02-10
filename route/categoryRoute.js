const express = require('express')
const { authenticateAdmin } = require('../middleware/userValidate')
const { addNewCategory, getAllCategoriesController, updateCategoryController, patchCategoryController, deleteCategoryController } = require('../controllers/categoryController')

const router = express.Router()

router.post('/', authenticateAdmin, addNewCategory)
router.get('/', getAllCategoriesController)
router.put('/:id', authenticateAdmin, updateCategoryController)
router.patch('/:id', authenticateAdmin, patchCategoryController)
router.delete('/:id', authenticateAdmin, deleteCategoryController)

module.exports = router