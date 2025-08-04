module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define('Recipe', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    instructions: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    cooking_time_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium'
    },
    servings: {
      type: DataTypes.INTEGER,
      defaultValue: 2
    },
    image_url: {
      type: DataTypes.STRING
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    source: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    }
  }, {
    tableName: 'recipes',
    timestamps: true,
    underscored: true
  });

  Recipe.associate = function(models) {
    Recipe.hasMany(models.RecipeIngredient, {
      foreignKey: 'recipe_id',
      as: 'recipeIngredients'
    });
  };

  return Recipe;
};