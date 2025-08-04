import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Ingredients from './pages/Ingredients';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import ShoppingList from './pages/ShoppingList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#ff6f00',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#388e3c',
    },
  },
  typography: {
    fontFamily: '"Noto Sans KR", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/ingredients" element={<Ingredients />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
                  <Route path="/shopping-list" element={<ShoppingList />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;