module.exports = (sequelize, DataTypes) => {
  const ShoppingListItem = sequelize.define('ShoppingListItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
    is_purchased: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'shopping_list_items',
    timestamps: true,
    underscored: true
  });

  ShoppingListItem.associate = function(models) {
    ShoppingListItem.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    ShoppingListItem.belongsTo(models.Ingredient, {
      foreignKey: 'ingredient_id',
      as: 'ingredient'
    });
  };

  return ShoppingListItem;
};