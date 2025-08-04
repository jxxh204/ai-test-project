const { Ingredient } = require('../models');
const { Op } = require('sequelize');

const getAllIngredients = async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};

    const ingredients = await Ingredient.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json(ingredients);
  } catch (error) {
    next(error);
  }
};

const searchIngredients = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const ingredients = await Ingredient.findAll({
      where: {
        name: {
          [Op.iLike]: `%${q}%`
        }
      },
      limit: 20,
      order: [['name', 'ASC']]
    });

    res.json(ingredients);
  } catch (error) {
    next(error);
  }
};

const getIngredientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const ingredient = await Ingredient.findByPk(id);
    
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    res.json(ingredient);
  } catch (error) {
    next(error);
  }
};

const createIngredient = async (req, res, next) => {
  try {
    const { name, category, unit, typical_shelf_life_days } = req.body;

    const ingredient = await Ingredient.create({
      name,
      category,
      unit,
      typical_shelf_life_days
    });

    res.status(201).json(ingredient);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllIngredients,
  searchIngredients,
  getIngredientById,
  createIngredient
};