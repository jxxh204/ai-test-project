import api from './api';

const recipeService = {
  getAllRecipes: async (filters = {}) => {
    const response = await api.get('/recipes', { params: filters });
    return response.data;
  },

  getRecommendedRecipes: async (filters = {}) => {
    const response = await api.get('/recipes/recommendations', { params: filters });
    return response.data;
  },

  getRecipeById: async (id) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },

  cookRecipe: async (id, options = {}) => {
    const response = await api.post(`/recipes/${id}/cook`, options);
    return response.data;
  }
};

export default recipeService;