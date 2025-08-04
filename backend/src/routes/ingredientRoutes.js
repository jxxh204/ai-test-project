const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const { authenticate } = require('../middleware/auth');

// All ingredient routes require authentication
router.use(authenticate);

// Get all ingredients
router.get('/', ingredientController.getAllIngredients);

// Search ingredients
router.get('/search', ingredientController.searchIngredients);

// Get ingredient by ID
router.get('/:id', ingredientController.getIngredientById);

// Create new ingredient
router.post('/', ingredientController.createIngredient);

module.exports = router;