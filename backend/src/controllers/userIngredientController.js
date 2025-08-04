const { UserIngredient, Ingredient } = require('../models');
const { Op } = require('sequelize');
const { addDays } = require('date-fns');

const getUserIngredients = async (req, res, next) => {
  try {
    const { storage_location, sort } = req.query;
    const userId = req.user.id;

    const where = {
      user_id: userId,
      is_consumed: false
    };

    if (storage_location) {
      where.storage_location = storage_location;
    }

    let order = [['expiration_date', 'ASC']];
    if (sort === 'name') {
      order = [[{ model: Ingredient, as: 'ingredient' }, 'name', 'ASC']];
    }

    const userIngredients = await UserIngredient.findAll({
      where,
      include: [{
        model: Ingredient,
        as: 'ingredient',
        attributes: ['id', 'name', 'category', 'unit']
      }],
      order
    });

    res.json(userIngredients);
  } catch (error) {
    next(error);
  }
};

const getExpiringIngredients = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { days = 3 } = req.query;

    const expirationDate = addDays(new Date(), parseInt(days));

    const expiringIngredients = await UserIngredient.findAll({
      where: {
        user_id: userId,
        is_consumed: false,
        expiration_date: {
          [Op.lte]: expirationDate
        }
      },
      include: [{
        model: Ingredient,
        as: 'ingredient',
        attributes: ['id', 'name', 'category', 'unit']
      }],
      order: [['expiration_date', 'ASC']]
    });

    res.json(expiringIngredients);
  } catch (error) {
    next(error);
  }
};

const addUserIngredient = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ingredient_id, quantity, storage_location, expiration_date, notes } = req.body;

    // Verify ingredient exists
    const ingredient = await Ingredient.findByPk(ingredient_id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    // Calculate expiration date if not provided
    const expirationDate = expiration_date || 
      addDays(new Date(), ingredient.typical_shelf_life_days);

    const userIngredient = await UserIngredient.create({
      user_id: userId,
      ingredient_id,
      quantity,
      storage_location,
      expiration_date: expirationDate,
      notes
    });

    // Fetch with ingredient details
    const result = await UserIngredient.findByPk(userIngredient.id, {
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

const updateUserIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { quantity, storage_location, expiration_date, notes } = req.body;

    const userIngredient = await UserIngredient.findOne({
      where: { id, user_id: userId }
    });

    if (!userIngredient) {
      return res.status(404).json({ error: 'User ingredient not found' });
    }

    await userIngredient.update({
      quantity,
      storage_location,
      expiration_date,
      notes
    });

    // Fetch with ingredient details
    const result = await UserIngredient.findByPk(userIngredient.id, {
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

const deleteUserIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const userIngredient = await UserIngredient.findOne({
      where: { id, user_id: userId }
    });

    if (!userIngredient) {
      return res.status(404).json({ error: 'User ingredient not found' });
    }

    await userIngredient.update({ is_consumed: true });

    res.json({ message: 'Ingredient marked as consumed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserIngredients,
  getExpiringIngredients,
  addUserIngredient,
  updateUserIngredient,
  deleteUserIngredient
};