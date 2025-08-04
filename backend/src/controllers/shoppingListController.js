const { ShoppingListItem, Ingredient } = require('../models');

const getShoppingList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { isPurchased } = req.query;

    const where = { user_id: userId };
    if (isPurchased !== undefined) {
      where.is_purchased = isPurchased === 'true';
    }

    const shoppingList = await ShoppingListItem.findAll({
      where,
      include: [{
        model: Ingredient,
        as: 'ingredient',
        attributes: ['id', 'name', 'category', 'unit']
      }],
      order: [
        ['is_purchased', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    res.json(shoppingList);
  } catch (error) {
    next(error);
  }
};

const addToShoppingList = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ingredient_id, quantity, notes } = req.body;

    // Check if ingredient exists
    const ingredient = await Ingredient.findByPk(ingredient_id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    // Check if already in shopping list
    const existingItem = await ShoppingListItem.findOne({
      where: {
        user_id: userId,
        ingredient_id,
        is_purchased: false
      }
    });

    if (existingItem) {
      // Update quantity if already exists
      await existingItem.update({
        quantity: existingItem.quantity + quantity
      });

      const updatedItem = await ShoppingListItem.findByPk(existingItem.id, {
        include: [{
          model: Ingredient,
          as: 'ingredient',
          attributes: ['id', 'name', 'category', 'unit']
        }]
      });

      return res.json(updatedItem);
    }

    // Create new shopping list item
    const shoppingListItem = await ShoppingListItem.create({
      user_id: userId,
      ingredient_id,
      quantity,
      notes
    });

    const result = await ShoppingListItem.findByPk(shoppingListItem.id, {
      include: [{
        model: Ingredient,
        as: 'ingredient',
        attributes: ['id', 'name', 'category', 'unit']
      }]
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateShoppingListItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { quantity, notes } = req.body;

    const shoppingListItem = await ShoppingListItem.findOne({
      where: { id, user_id: userId }
    });

    if (!shoppingListItem) {
      return res.status(404).json({ error: 'Shopping list item not found' });
    }

    await shoppingListItem.update({
      quantity,
      notes
    });

    const result = await ShoppingListItem.findByPk(shoppingListItem.id, {
      include: [{
        model: Ingredient,
        as: 'ingredient',
        attributes: ['id', 'name', 'category', 'unit']
      }]
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const removeFromShoppingList = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const shoppingListItem = await ShoppingListItem.findOne({
      where: { id, user_id: userId }
    });

    if (!shoppingListItem) {
      return res.status(404).json({ error: 'Shopping list item not found' });
    }

    await shoppingListItem.destroy();

    res.json({ message: 'Item removed from shopping list' });
  } catch (error) {
    next(error);
  }
};

const markAsPurchased = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { addToInventory = true } = req.body;

    const shoppingListItem = await ShoppingListItem.findOne({
      where: { id, user_id: userId },
      include: [{
        model: Ingredient,
        as: 'ingredient'
      }]
    });

    if (!shoppingListItem) {
      return res.status(404).json({ error: 'Shopping list item not found' });
    }

    // Mark as purchased
    await shoppingListItem.update({ is_purchased: true });

    // Add to inventory if requested
    if (addToInventory) {
      const { UserIngredient } = require('../models');
      const { addDays } = require('date-fns');

      await UserIngredient.create({
        user_id: userId,
        ingredient_id: shoppingListItem.ingredient_id,
        quantity: shoppingListItem.quantity,
        storage_location: 'fridge',
        expiration_date: addDays(new Date(), shoppingListItem.ingredient.typical_shelf_life_days)
      });
    }

    res.json({
      message: 'Item marked as purchased',
      addedToInventory: addToInventory
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShoppingList,
  addToShoppingList,
  updateShoppingListItem,
  removeFromShoppingList,
  markAsPurchased
};