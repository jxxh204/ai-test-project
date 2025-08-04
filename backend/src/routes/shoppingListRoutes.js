const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get user's shopping list
router.get('/', shoppingListController.getShoppingList);

// Add item to shopping list
router.post('/', shoppingListController.addToShoppingList);

// Update shopping list item
router.put('/:id', shoppingListController.updateShoppingListItem);

// Remove item from shopping list
router.delete('/:id', shoppingListController.removeFromShoppingList);

// Mark item as purchased
router.post('/:id/purchase', shoppingListController.markAsPurchased);

module.exports = router;