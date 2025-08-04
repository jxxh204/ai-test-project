module.exports = (sequelize, DataTypes) => {
  const RecipeIngredient = sequelize.define('RecipeIngredient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recipes',
        key: 'id'
      }
    },
    ingredient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ingredients',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    is_optional: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'recipe_ingredients',
    timestamps: true,
    underscored: true
  });

  RecipeIngredient.associate = function(models) {
    RecipeIngredient.belongsTo(models.Recipe, {
      foreignKey: 'recipe_id',
      as: 'recipe'
    });
    RecipeIngredient.belongsTo(models.Ingredient, {
      foreignKey: 'ingredient_id',
      as: 'ingredient'
    });
  };

  return RecipeIngredient;
};