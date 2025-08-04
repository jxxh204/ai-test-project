import api from './api';

const ingredientService = {
  getAllIngredients: async (category) => {
    const params = category ? { category } : {};
    const response = await api.get('/ingredients', { params });
    return response.data;
  },

  searchIngredients: async (query) => {
    const response = await api.get('/ingredients/search', { params: { q: query } });
    return response.data;
  },

  getUserIngredients: async (filters = {}) => {
    const response = await api.get('/user-ingredients', { params: filters });
    return response.data;
  },

  getExpiringIngredients: async (days = 3) => {
    const response = await api.get('/user-ingredients/expiring', { params: { days } });
    return response.data;
  },

  addUserIngredient: async (ingredientData) => {
    const response = await api.post('/user-ingredients', ingredientData);
    return response.data;
  },

  updateUserIngredient: async (id, updateData) => {
    const response = await api.put(`/user-ingredients/${id}`, updateData);
    return response.data;
  },

  deleteUserIngredient: async (id) => {
    const response = await api.delete(`/user-ingredients/${id}`);
    return response.data;
  }
};

export default ingredientService;