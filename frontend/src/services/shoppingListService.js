import api from './api';

const shoppingListService = {
  getShoppingList: async (isPurchased) => {
    const params = isPurchased !== undefined ? { isPurchased } : {};
    const response = await api.get('/shopping-list', { params });
    return response.data;
  },

  addToShoppingList: async (itemData) => {
    const response = await api.post('/shopping-list', itemData);
    return response.data;
  },

  updateShoppingListItem: async (id, updateData) => {
    const response = await api.put(`/shopping-list/${id}`, updateData);
    return response.data;
  },

  removeFromShoppingList: async (id) => {
    const response = await api.delete(`/shopping-list/${id}`);
    return response.data;
  },

  markAsPurchased: async (id, addToInventory = true) => {
    const response = await api.post(`/shopping-list/${id}/purchase`, { addToInventory });
    return response.data;
  }
};

export default shoppingListService;