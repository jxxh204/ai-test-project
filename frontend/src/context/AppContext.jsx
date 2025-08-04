import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [userIngredients, setUserIngredients] = useState([]);
  const [expiringIngredients, setExpiringIngredients] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const value = {
    userIngredients,
    setUserIngredients,
    expiringIngredients,
    setExpiringIngredients,
    shoppingList,
    setShoppingList,
    loading,
    setLoading,
    notification,
    showNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};