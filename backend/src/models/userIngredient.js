module.exports = (sequelize, DataTypes) => {
  const UserIngredient = sequelize.define('UserIngredient', {
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
    storage_location: {
      type: DataTypes.ENUM('fridge', 'freezer', 'pantry'),
      defaultValue: 'fridge'
    },
    purchase_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notes: {
      type: DataTypes.STRING
    },
    is_consumed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'user_ingredients',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id', 'expiration_date']
      },
      {
        fields: ['expiration_date']
      }
    ]
  });

  UserIngredient.associate = function(models) {
    UserIngredient.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    UserIngredient.belongsTo(models.Ingredient, {
      foreignKey: 'ingredient_id',
      as: 'ingredient'
    });
  };

  return UserIngredient;
};