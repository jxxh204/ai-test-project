module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    category: {
      type: DataTypes.ENUM('vegetables', 'fruits', 'dairy', 'meat', 'grains', 'spices', 'condiments', 'other'),
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'piece'
    },
    typical_shelf_life_days: {
      type: DataTypes.INTEGER,
      defaultValue: 7
    }
  }, {
    tableName: 'ingredients',
    timestamps: true,
    underscored: true
  });

  Ingredient.associate = function(models) {
    Ingredient.hasMany(models.UserIngredient, {
      foreignKey: 'ingredient_id',
      as: 'userIngredients'
    });
    Ingredient.hasMany(models.RecipeIngredient, {
      foreignKey: 'ingredient_id',
      as: 'recipeIngredients'
    });
  };

  return Ingredient;
};