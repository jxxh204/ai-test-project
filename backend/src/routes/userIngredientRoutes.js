const express = require('express');
const router = express.Router();
const userIngredientController = require('../controllers/userIngredientController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get user's ingredients
router.get('/', userIngredientController.getUserIngredients);

// Get expiring ingredients
router.get('/expiring', userIngredientController.getExpiringIngredients);

// Add ingredient to user's inventory
router.post('/', userIngredientController.addUserIngredient);

// Update user ingredient
router.put('/:id', userIngredientController.updateUserIngredient);

// Delete (consume) user ingredient
router.delete('/:id', userIngredientController.deleteUserIngredient);

module.exports = router;