const { sequelize, Sequelize } = require('../config/database');
const User = require('./user');
const Ingredient = require('./ingredient');
const Recipe = require('./recipe');
const UserIngredient = require('./userIngredient');
const RecipeIngredient = require('./recipeIngredient');
const ShoppingListItem = require('./shoppingListItem');

// Initialize models
const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Ingredient: Ingredient(sequelize, Sequelize.DataTypes),
  Recipe: Recipe(sequelize, Sequelize.DataTypes),
  UserIngredient: UserIngredient(sequelize, Sequelize.DataTypes),
  RecipeIngredient: RecipeIngredient(sequelize, Sequelize.DataTypes),
  ShoppingListItem: ShoppingListItem(sequelize, Sequelize.DataTypes)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;