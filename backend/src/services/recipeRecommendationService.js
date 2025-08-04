const { UserIngredient, Recipe, RecipeIngredient, Ingredient } = require('../models');
const { Op } = require('sequelize');
const { addDays } = require('date-fns');

class RecipeRecommendationService {
  /**
   * Get recipe recommendations based on user's ingredients
   * Prioritizes recipes that use expiring ingredients
   */
  static async getRecommendations(userId, filters = {}) {
    const { cookingTime, difficulty, limit = 10 } = filters;

    // Get user's available ingredients
    const userIngredients = await UserIngredient.findAll({
      where: {
        user_id: userId,
        is_consumed: false
      },
      include: [{
        model: Ingredient,
        as: 'ingredient'
      }]
    });

    // Get expiring ingredients (within 3 days)
    const expiringDate = addDays(new Date(), 3);
    const expiringIngredientIds = userIngredients
      .filter(ui => ui.expiration_date <= expiringDate)
      .map(ui => ui.ingredient_id);

    // Build recipe query
    const recipeWhere = {};
    if (cookingTime) {
      recipeWhere.cooking_time_minutes = { [Op.lte]: cookingTime };
    }
    if (difficulty) {
      recipeWhere.difficulty = difficulty;
    }

    // Get all recipes with their ingredients
    const recipes = await Recipe.findAll({
      where: recipeWhere,
      include: [{
        model: RecipeIngredient,
        as: 'recipeIngredients',
        include: [{
          model: Ingredient,
          as: 'ingredient'
        }]
      }]
    });

    // Calculate match scores for each recipe
    const userIngredientIds = userIngredients.map(ui => ui.ingredient_id);
    const scoredRecipes = recipes.map(recipe => {
      const recipeIngredients = recipe.recipeIngredients;
      const requiredIngredients = recipeIngredients.filter(ri => !ri.is_optional);
      const optionalIngredients = recipeIngredients.filter(ri => ri.is_optional);

      // Calculate ingredient matches
      const requiredMatches = requiredIngredients.filter(ri => 
        userIngredientIds.includes(ri.ingredient_id)
      ).length;
      const optionalMatches = optionalIngredients.filter(ri => 
        userIngredientIds.includes(ri.ingredient_id)
      ).length;
      const totalRequired = requiredIngredients.length;

      // Calculate missing ingredients
      const missingIngredients = requiredIngredients
        .filter(ri => !userIngredientIds.includes(ri.ingredient_id))
        .map(ri => ri.ingredient);

      // Calculate expiring ingredient usage
      const expiringIngredientUsage = recipeIngredients.filter(ri => 
        expiringIngredientIds.includes(ri.ingredient_id)
      ).length;

      // Calculate match percentage
      const matchPercentage = totalRequired > 0 
        ? (requiredMatches / totalRequired) * 100 
        : 0;

      // Calculate score (prioritize recipes using expiring ingredients)
      const score = matchPercentage + (expiringIngredientUsage * 20) + (optionalMatches * 5);

      return {
        recipe: recipe.toJSON(),
        matchPercentage,
        requiredMatches,
        totalRequired,
        optionalMatches,
        missingIngredients,
        expiringIngredientUsage,
        score
      };
    });

    // Sort by score and filter based on match criteria
    const recommendations = scoredRecipes
      .filter(sr => sr.matchPercentage >= 50) // At least 50% match
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Check if a recipe can be cooked with user's available ingredients
   */
  static async canCookRecipe(userId, recipeId) {
    const recipe = await Recipe.findByPk(recipeId, {
      include: [{
        model: RecipeIngredient,
        as: 'recipeIngredients',
        where: { is_optional: false }
      }]
    });

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const userIngredients = await UserIngredient.findAll({
      where: {
        user_id: userId,
        is_consumed: false
      }
    });

    const userIngredientIds = userIngredients.map(ui => ui.ingredient_id);
    const requiredIngredientIds = recipe.recipeIngredients.map(ri => ri.ingredient_id);

    const missingIngredients = requiredIngredientIds.filter(
      id => !userIngredientIds.includes(id)
    );

    return {
      canCook: missingIngredients.length === 0,
      missingIngredients
    };
  }

  /**
   * Get ingredients that would be consumed if a recipe is cooked
   */
  static async getIngredientsToConsume(userId, recipeId) {
    const recipe = await Recipe.findByPk(recipeId, {
      include: [{
        model: RecipeIngredient,
        as: 'recipeIngredients'
      }]
    });

    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const userIngredients = await UserIngredient.findAll({
      where: {
        user_id: userId,
        is_consumed: false,
        ingredient_id: {
          [Op.in]: recipe.recipeIngredients.map(ri => ri.ingredient_id)
        }
      },
      include: [{
        model: Ingredient,
        as: 'ingredient'
      }],
      order: [['expiration_date', 'ASC']] // Use oldest ingredients first
    });

    return userIngredients;
  }
}

module.exports = RecipeRecommendationService;