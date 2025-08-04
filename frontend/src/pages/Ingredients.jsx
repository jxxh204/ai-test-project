import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Chip,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Kitchen as KitchenIcon,
  AcUnit as FreezerIcon,
  Inventory as PantryIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ingredientService from '../services/ingredientService';
import { useApp } from '../context/AppContext';

function Ingredients() {
  const { userIngredients, setUserIngredients, showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState({
    ingredient_id: '',
    quantity: '',
    storage_location: 'fridge',
    expiration_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  useEffect(() => {
    loadIngredients();
    loadAllIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientService.getUserIngredients();
      setUserIngredients(data);
    } catch (error) {
      showNotification('재료를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAllIngredients = async () => {
    try {
      const data = await ingredientService.getAllIngredients();
      setAllIngredients(data);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const results = await ingredientService.searchIngredients(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const getFilteredIngredients = () => {
    const storageLocations = ['all', 'fridge', 'freezer', 'pantry'];
    const location = storageLocations[tabValue];
    
    if (location === 'all') {
      return userIngredients;
    }
    
    return userIngredients.filter(item => item.storage_location === location);
  };

  const getDaysUntilExpiry = (expirationDate) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryChipProps = (daysLeft) => {
    if (daysLeft < 0) {
      return { label: '만료됨', color: 'error' };
    } else if (daysLeft === 0) {
      return { label: '오늘까지', color: 'error' };
    } else if (daysLeft <= 3) {
      return { label: `D-${daysLeft}`, color: 'warning' };
    } else {
      return { label: `D-${daysLeft}`, color: 'default' };
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ingredient_id: item.ingredient_id,
        quantity: item.quantity.toString(),
        storage_location: item.storage_location,
        expiration_date: format(new Date(item.expiration_date), 'yyyy-MM-dd'),
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        ingredient_id: '',
        quantity: '',
        storage_location: 'fridge',
        expiration_date: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        quantity: parseFloat(formData.quantity)
      };

      if (editingItem) {
        await ingredientService.updateUserIngredient(editingItem.id, data);
        showNotification('재료가 수정되었습니다.', 'success');
      } else {
        await ingredientService.addUserIngredient(data);
        showNotification('재료가 추가되었습니다.', 'success');
      }

      await loadIngredients();
      handleCloseDialog();
    } catch (error) {
      showNotification('작업에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('이 재료를 삭제하시겠습니까?')) {
      try {
        await ingredientService.deleteUserIngredient(id);
        showNotification('재료가 삭제되었습니다.', 'success');
        await loadIngredients();
      } catch (error) {
        showNotification('삭제에 실패했습니다.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">내 재료 관리</Typography>
        <Fab color="primary" onClick={() => handleOpenDialog()}>
          <AddIcon />
        </Fab>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="전체" />
        <Tab label="냉장" icon={<KitchenIcon />} iconPosition="start" />
        <Tab label="냉동" icon={<FreezerIcon />} iconPosition="start" />
        <Tab label="실온" icon={<PantryIcon />} iconPosition="start" />
      </Tabs>

      <Grid container spacing={2}>
        {getFilteredIngredients().map((item) => {
          const daysLeft = getDaysUntilExpiry(item.expiration_date);
          const chipProps = getExpiryChipProps(daysLeft);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Typography variant="h6">
                      {item.ingredient.name}
                    </Typography>
                    <Chip {...chipProps} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    수량: {item.quantity}{item.ingredient.unit}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    보관: {item.storage_location === 'fridge' ? '냉장' : 
                          item.storage_location === 'freezer' ? '냉동' : '실온'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    유통기한: {format(new Date(item.expiration_date), 'yyyy년 MM월 dd일', { locale: ko })}
                  </Typography>
                  {item.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      메모: {item.notes}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* 재료 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? '재료 수정' : '재료 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {!editingItem && (
              <>
                <TextField
                  fullWidth
                  label="재료 검색"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  sx={{ mb: 2 }}
                />
                {searchResults.length > 0 && (
                  <Box sx={{ mb: 2, maxHeight: 200, overflowY: 'auto' }}>
                    {searchResults.map((ingredient) => (
                      <Button
                        key={ingredient.id}
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 1, justifyContent: 'flex-start' }}
                        onClick={() => {
                          setFormData({ ...formData, ingredient_id: ingredient.id });
                          setSearchQuery(ingredient.name);
                          setSearchResults([]);
                        }}
                      >
                        {ingredient.name}
                      </Button>
                    ))}
                  </Box>
                )}
              </>
            )}
            
            <TextField
              fullWidth
              type="number"
              label="수량"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>보관 위치</InputLabel>
              <Select
                value={formData.storage_location}
                onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
                label="보관 위치"
              >
                <MenuItem value="fridge">냉장</MenuItem>
                <MenuItem value="freezer">냉동</MenuItem>
                <MenuItem value="pantry">실온</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              type="date"
              label="유통기한"
              value={formData.expiration_date}
              onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="메모 (선택사항)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.ingredient_id || !formData.quantity}
          >
            {editingItem ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Ingredients;