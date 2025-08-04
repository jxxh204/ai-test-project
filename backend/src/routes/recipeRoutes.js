const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all recipes
router.get('/', recipeController.getAllRecipes);

// Get recommended recipes based on user's ingredients
router.get('/recommendations', recipeController.getRecommendedRecipes);

// Get recipe by ID
router.get('/:id', recipeController.getRecipeById);

// Mark recipe as cooked (consume ingredients)
router.post('/:id/cook', recipeController.cookRecipe);

module.exports = router;