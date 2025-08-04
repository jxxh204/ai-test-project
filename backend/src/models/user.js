module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        dietary_restrictions: [],
        cooking_skill_level: 'beginner',
        preferred_cooking_time: 30
      }
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = function(models) {
    User.hasMany(models.UserIngredient, {
      foreignKey: 'user_id',
      as: 'userIngredients'
    });
    User.hasMany(models.ShoppingListItem, {
      foreignKey: 'user_id',
      as: 'shoppingListItems'
    });
  };

  return User;
};