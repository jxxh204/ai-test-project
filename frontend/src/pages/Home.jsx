import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  Kitchen as KitchenIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import ingredientService from '../services/ingredientService';
import recipeService from '../services/recipeService';
import { useApp } from '../context/AppContext';

function Home() {
  const navigate = useNavigate();
  const { setExpiringIngredients, showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalIngredients: 0,
    expiringCount: 0,
    recommendedRecipes: []
  });
  const [expiringItems, setExpiringItems] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user ingredients
      const userIngredients = await ingredientService.getUserIngredients();
      
      // Load expiring ingredients
      const expiring = await ingredientService.getExpiringIngredients(3);
      setExpiringItems(expiring);
      setExpiringIngredients(expiring);
      
      // Load recommended recipes
      const recommendations = await recipeService.getRecommendedRecipes({ limit: 3 });
      
      setStats({
        totalIngredients: userIngredients.length,
        expiringCount: expiring.length,
        recommendedRecipes: recommendations
      });
    } catch (error) {
      showNotification('데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expirationDate) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <Typography variant="h4" gutterBottom>
        안녕하세요! FridgeChef입니다
      </Typography>
      
      {/* 임박 재료 알림 */}
      {stats.expiringCount > 0 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/ingredients')}>
              확인하기
            </Button>
          }
          sx={{ mb: 3 }}
        >
          유통기한이 임박한 재료가 {stats.expiringCount}개 있습니다!
        </Alert>
      )}

      {/* 대시보드 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { elevation: 6 }
            }}
            onClick={() => navigate('/ingredients')}
          >
            <KitchenIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              내 재료
            </Typography>
            <Typography variant="h4" color="primary">
              {stats.totalIngredients}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              개 보유중
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { elevation: 6 }
            }}
            onClick={() => navigate('/ingredients')}
          >
            <WarningIcon color="warning" sx={{ fontSize: 40 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              임박 재료
            </Typography>
            <Typography variant="h4" color="warning.main">
              {stats.expiringCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3일 이내
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { elevation: 6 }
            }}
            onClick={() => navigate('/recipes')}
          >
            <RestaurantIcon color="secondary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              추천 레시피
            </Typography>
            <Typography variant="h4" color="secondary">
              {stats.recommendedRecipes.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              개 가능
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { elevation: 6 }
            }}
            onClick={() => navigate('/shopping-list')}
          >
            <ShoppingCartIcon color="info" sx={{ fontSize: 40 }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              장보기
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              리스트 확인
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 임박 재료 리스트 */}
      {expiringItems.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            유통기한 임박 재료
          </Typography>
          <Grid container spacing={2}>
            {expiringItems.slice(0, 4).map((item) => {
              const daysLeft = getDaysUntilExpiry(item.expiration_date);
              return (
                <Grid item xs={12} sm={6} md={3} key={item.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {item.ingredient.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        수량: {item.quantity}{item.ingredient.unit}
                      </Typography>
                      <Chip 
                        label={daysLeft <= 0 ? '만료됨' : `D-${daysLeft}`}
                        color={daysLeft <= 1 ? 'error' : 'warning'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* 추천 레시피 */}
      {stats.recommendedRecipes.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            추천 레시피
          </Typography>
          <Grid container spacing={2}>
            {stats.recommendedRecipes.map((item) => (
              <Grid item xs={12} md={4} key={item.recipe.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.recipe.name}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Chip 
                        label={`${item.recipe.cooking_time_minutes}분`} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={item.recipe.difficulty === 'easy' ? '쉬움' : 
                               item.recipe.difficulty === 'medium' ? '보통' : '어려움'} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      매칭률: {Math.round(item.matchPercentage)}%
                    </Typography>
                    {item.expiringIngredientUsage > 0 && (
                      <Chip 
                        label={`임박재료 ${item.expiringIngredientUsage}개 활용`}
                        color="warning"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/recipes/${item.recipe.id}`)}
                    >
                      레시피 보기
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default Home;