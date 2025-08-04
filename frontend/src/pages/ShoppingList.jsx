import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab,
  Divider,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import ingredientService from '../services/ingredientService';
import shoppingListService from '../services/shoppingListService';
import { useApp } from '../context/AppContext';

function ShoppingList() {
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState({
    ingredient_id: '',
    quantity: '',
    notes: ''
  });

  useEffect(() => {
    loadShoppingList();
    loadAllIngredients();
  }, []);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const data = await shoppingListService.getShoppingList();
      setShoppingList(data);
    } catch (error) {
      showNotification('장보기 리스트를 불러오는데 실패했습니다.', 'error');
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

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        ingredient_id: item.ingredient_id,
        quantity: item.quantity.toString(),
        notes: item.notes || ''
      });
      setSearchQuery(item.ingredient.name);
    } else {
      setEditingItem(null);
      setFormData({
        ingredient_id: '',
        quantity: '',
        notes: ''
      });
      setSearchQuery('');
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
        await shoppingListService.updateShoppingListItem(editingItem.id, data);
        showNotification('항목이 수정되었습니다.', 'success');
      } else {
        await shoppingListService.addToShoppingList(data);
        showNotification('항목이 추가되었습니다.', 'success');
      }

      await loadShoppingList();
      handleCloseDialog();
    } catch (error) {
      showNotification('작업에 실패했습니다.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await shoppingListService.removeFromShoppingList(id);
      showNotification('항목이 삭제되었습니다.', 'success');
      await loadShoppingList();
    } catch (error) {
      showNotification('삭제에 실패했습니다.', 'error');
    }
  };

  const handleTogglePurchased = async (item) => {
    try {
      if (!item.is_purchased) {
        const addToInventory = window.confirm('이 재료를 내 재료에 추가하시겠습니까?');
        await shoppingListService.markAsPurchased(item.id, addToInventory);
        
        if (addToInventory) {
          showNotification('구매 완료! 내 재료에 추가되었습니다.', 'success');
        } else {
          showNotification('구매 완료!', 'success');
        }
      } else {
        // 구매 취소 기능은 API에 없으므로 다시 추가하는 방식으로 처리
        await shoppingListService.updateShoppingListItem(item.id, {
          quantity: item.quantity,
          notes: item.notes
        });
        showNotification('구매가 취소되었습니다.', 'info');
      }
      
      await loadShoppingList();
    } catch (error) {
      showNotification('처리에 실패했습니다.', 'error');
    }
  };

  const unpurchasedItems = shoppingList.filter(item => !item.is_purchased);
  const purchasedItems = shoppingList.filter(item => item.is_purchased);

  const getCategoryColor = (category) => {
    const colors = {
      vegetables: 'success',
      fruits: 'warning',
      dairy: 'info',
      meat: 'error',
      grains: 'default',
      spices: 'secondary',
      condiments: 'primary',
      other: 'default'
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">장보기 리스트</Typography>
        <Fab color="primary" onClick={() => handleOpenDialog()}>
          <AddIcon />
        </Fab>
      </Box>

      {shoppingList.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            장보기 리스트가 비어있습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            필요한 재료를 추가해보세요!
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            재료 추가
          </Button>
        </Paper>
      ) : (
        <>
          {/* 구매 예정 항목 */}
          {unpurchasedItems.length > 0 && (
            <Paper sx={{ mb: 3 }}>
              <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="h6">
                  구매 예정 ({unpurchasedItems.length})
                </Typography>
              </Box>
              <List>
                {unpurchasedItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={false}
                          onClick={() => handleTogglePurchased(item)}
                          icon={<CircleIcon />}
                          checkedIcon={<CheckCircleIcon />}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {item.ingredient.name}
                            </Typography>
                            <Chip
                              label={item.ingredient.category}
                              size="small"
                              color={getCategoryColor(item.ingredient.category)}
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              수량: {item.quantity}{item.ingredient.unit}
                            </Typography>
                            {item.notes && (
                              <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                                메모: {item.notes}
                              </Typography>
                            )}
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleOpenDialog(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

          {/* 구매 완료 항목 */}
          {purchasedItems.length > 0 && (
            <Paper>
              <Box sx={{ p: 2, bgcolor: 'grey.200' }}>
                <Typography variant="h6" color="text.secondary">
                  구매 완료 ({purchasedItems.length})
                </Typography>
              </Box>
              <List>
                {purchasedItems.map((item, index) => (
                  <React.Fragment key={item.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ opacity: 0.7 }}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={true}
                          disabled
                          icon={<CircleIcon />}
                          checkedIcon={<CheckCircleIcon />}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ textDecoration: 'line-through' }}>
                            {item.ingredient.name}
                          </Typography>
                        }
                        secondary={`수량: ${item.quantity}${item.ingredient.unit}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={() => handleDelete(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </>
      )}

      {/* 재료 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? '항목 수정' : '항목 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="재료 검색"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ mb: 2 }}
              disabled={!!editingItem}
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
            
            <TextField
              fullWidth
              type="number"
              label="수량"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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

export default ShoppingList;