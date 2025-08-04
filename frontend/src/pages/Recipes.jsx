import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import recipeService from '../services/recipeService';
import { useApp } from '../context/AppContext';

function Recipes() {
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [viewMode, setViewMode] = useState('recommended');
  const [filters, setFilters] = useState({
    difficulty: '',
    maxTime: '',
    tags: ''
  });

  useEffect(() => {
    loadRecipes();
  }, [viewMode, filters]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      let data;
      
      if (viewMode === 'recommended') {
        data = await recipeService.getRecommendedRecipes({
          cookingTime: filters.maxTime || undefined,
          difficulty: filters.difficulty || undefined
        });
      } else {
        data = await recipeService.getAllRecipes(filters);
      }
      
      setRecipes(data);
    } catch (error) {
      showNotification('레시피를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getDifficultyText = (difficulty) => {
    const map = {
      easy: '쉬움',
      medium: '보통',
      hard: '어려움'
    };
    return map[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty) => {
    const map = {
      easy: 'success',
      medium: 'warning',
      hard: 'error'
    };
    return map[difficulty] || 'default';
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
        레시피
      </Typography>

      {/* 뷰 모드 선택 */}
      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(e, newMode) => newMode && setViewMode(newMode)}
          aria-label="view mode"
        >
          <ToggleButton value="recommended" aria-label="recommended">
            추천 레시피
          </ToggleButton>
          <ToggleButton value="all" aria-label="all">
            전체 레시피
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 필터 */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>난이도</InputLabel>
          <Select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            label="난이도"
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="easy">쉬움</MenuItem>
            <MenuItem value="medium">보통</MenuItem>
            <MenuItem value="hard">어려움</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>조리 시간</InputLabel>
          <Select
            value={filters.maxTime}
            onChange={(e) => handleFilterChange('maxTime', e.target.value)}
            label="조리 시간"
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="15">15분 이내</MenuItem>
            <MenuItem value="30">30분 이내</MenuItem>
            <MenuItem value="60">1시간 이내</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 추천 레시피 설명 */}
      {viewMode === 'recommended' && recipes.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          보유하신 재료를 기반으로 추천된 레시피입니다. 유통기한이 임박한 재료를 활용하는 레시피가 우선 추천됩니다.
        </Alert>
      )}

      {/* 레시피 목록 */}
      <Grid container spacing={3}>
        {recipes.map((item) => {
          const recipe = viewMode === 'recommended' ? item.recipe : item;
          const isRecommended = viewMode === 'recommended';
          
          return (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {recipe.image_url && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={recipe.image_url}
                    alt={recipe.name}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {recipe.name}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={<TimerIcon />}
                      label={`${recipe.cooking_time_minutes}분`}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={getDifficultyText(recipe.difficulty)}
                      color={getDifficultyColor(recipe.difficulty)}
                      size="small"
                    />
                  </Box>

                  {recipe.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {recipe.description}
                    </Typography>
                  )}

                  {isRecommended && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="primary">
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
                      {item.missingIngredients.length > 0 && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                          부족한 재료: {item.missingIngredients.map(i => i.name).join(', ')}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {recipe.tags && recipe.tags.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {recipe.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          icon={<TagIcon />}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    레시피 보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {recipes.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <RestaurantIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {viewMode === 'recommended' 
              ? '추천할 레시피가 없습니다. 재료를 더 추가해보세요!' 
              : '레시피가 없습니다.'}
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Recipes;