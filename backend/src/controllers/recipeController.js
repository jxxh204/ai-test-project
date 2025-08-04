const { Recipe, RecipeIngredient, Ingredient, UserIngredient, ShoppingListItem } = require('../models');
const RecipeRecommendationService = require('../services/recipeRecommendationService');
const { Op } = require('sequelize');

const getAllRecipes = async (req, res, next) => {
  try {
    const { difficulty, maxTime, tags } = req.query;
    const where = {};

    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (maxTime) {
      where.cooking_time_minutes = { [Op.lte]: parseInt(maxTime) };
    }
    if (tags) {
      where.tags = { [Op.contains]: tags.split(',') };
    }

    const recipes = await Recipe.findAll({
      where,
      include: [{
        model: RecipeIngredient,
        as: 'recipeIngredients',
        include: [{
          model: Ingredient,
          as: 'ingredient',
          attributes: ['id', 'name', 'unit']
        }]
      }],
      order: [['name', 'ASC']]
    });

    res.json(recipes);
  } catch (error) {
    next(error);
  }
};

const getRecommendedRecipes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { cookingTime, difficulty, limit } = req.query;

    const recommendations = await RecipeRecommendationService.getRecommendations(
      userId, 
      { cookingTime, difficulty, limit }
    );

    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recipe = await Recipe.findByPk(id, {
      include: [{
        model: RecipeIngredient,
        as: 'recipeIngredients',
        include: [{
          model: Ingredient,
          as: 'ingredient'
        }]
      }]
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Check if user can cook this recipe
    const { canCook, missingIngredients } = await RecipeRecommendationService.canCookRecipe(
      userId, 
      id
    );

    const recipeData = recipe.toJSON();
    recipeData.canCook = canCook;
    recipeData.missingIngredients = missingIngredients;

    res.json(recipeData);
  } catch (error) {
    next(error);
  }
};

const cookRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { addMissingToShoppingList = false } = req.body;

    // Check if user can cook this recipe
    const { canCook, missingIngredients } = await RecipeRecommendationService.canCookRecipe(
      userId, 
      id
    );

    if (!canCook && !addMissingToShoppingList) {
      return res.status(400).json({
        error: 'Cannot cook recipe due to missing ingredients',
        missingIngredients
      });
    }

    // If there are missing ingredients and user wants to add them to shopping list
    if (!canCook && addMissingToShoppingList) {
      for (const ingredientId of missingIngredients) {
        const recipe = await Recipe.findByPk(id, {
          include: [{
            model: RecipeIngredient,
            as: 'recipeIngredients',
            where: { ingredient_id: ingredientId }
          }]
        });

        const recipeIngredient = recipe.recipeIngredients[0];
        
        // Check if already in shopping list
        const existingItem = await ShoppingListItem.findOne({
          where: {
            user_id: userId,
            ingredient_id: ingredientId,
            is_purchased: false
          }
        });

        if (!existingItem) {
          await ShoppingListItem.create({
            user_id: userId,
            ingredient_id: ingredientId,
            quantity: recipeIngredient.quantity,
            notes: `For recipe: ${recipe.name}`
          });
        }
      }
    }

    // Get ingredients to consume
    const ingredientsToConsume = await RecipeRecommendationService.getIngredientsToConsume(
      userId, 
      id
    );

    // Mark ingredients as consumed
    for (const userIngredient of ingredientsToConsume) {
      await userIngredient.update({ is_consumed: true });
    }

    res.json({
      message: 'Recipe cooked successfully',
      consumedIngredients: ingredientsToConsume.map(ui => ({
        id: ui.id,
        name: ui.ingredient.name,
        quantity: ui.quantity
      })),
      missingIngredientsAddedToShoppingList: !canCook && addMissingToShoppingList ? missingIngredients : []
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecipes,
  getRecommendedRecipes,
  getRecipeById,
  cookRecipe
};