import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent
} from '@mui/material';
import {
  Timer as TimerIcon,
  Restaurant as RestaurantIcon,
  Check as CheckIcon,
  ShoppingCart as ShoppingCartIcon,
  Kitchen as KitchenIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import recipeService from '../services/recipeService';
import shoppingListService from '../services/shoppingListService';
import { useApp } from '../context/AppContext';

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [cookingMode, setCookingMode] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [cookDialogOpen, setCookDialogOpen] = useState(false);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getRecipeById(id);
      setRecipe(data);
    } catch (error) {
      showNotification('레시피를 불러오는데 실패했습니다.', 'error');
      navigate('/recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCooking = () => {
    if (!recipe.canCook) {
      setCookDialogOpen(true);
    } else {
      setCookingMode(true);
    }
  };

  const handleCookWithMissing = async (addToShoppingList) => {
    try {
      const result = await recipeService.cookRecipe(id, {
        addMissingToShoppingList: addToShoppingList
      });
      
      showNotification('요리를 시작합니다!', 'success');
      setCookDialogOpen(false);
      setCookingMode(true);
      
      if (addToShoppingList && result.missingIngredientsAddedToShoppingList.length > 0) {
        showNotification('부족한 재료가 장보기 리스트에 추가되었습니다.', 'info');
      }
    } catch (error) {
      showNotification('요리 시작에 실패했습니다.', 'error');
    }
  };

  const handleStepComplete = (stepIndex) => {
    if (completedSteps.includes(stepIndex)) {
      setCompletedSteps(completedSteps.filter(i => i !== stepIndex));
    } else {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handleFinishCooking = async () => {
    try {
      await recipeService.cookRecipe(id);
      showNotification('요리가 완료되었습니다! 재료가 차감되었습니다.', 'success');
      navigate('/');
    } catch (error) {
      showNotification('요리 완료 처리에 실패했습니다.', 'error');
    }
  };

  const addMissingToShoppingList = async () => {
    try {
      for (const ingredient of recipe.missingIngredients) {
        await shoppingListService.addToShoppingList({
          ingredient_id: ingredient,
          quantity: 1,
          notes: `${recipe.name} 레시피용`
        });
      }
      showNotification('부족한 재료가 장보기 리스트에 추가되었습니다.', 'success');
      setCookDialogOpen(false);
    } catch (error) {
      showNotification('장보기 리스트 추가에 실패했습니다.', 'error');
    }
  };

  const getDifficultyText = (difficulty) => {
    const map = {
      easy: '쉬움',
      medium: '보통',
      hard: '어려움'
    };
    return map[difficulty] || difficulty;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {recipe.name}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Chip
                icon={<TimerIcon />}
                label={`${recipe.cooking_time_minutes}분`}
                sx={{ mr: 1 }}
              />
              <Chip
                icon={<RestaurantIcon />}
                label={getDifficultyText(recipe.difficulty)}
                color={recipe.difficulty === 'easy' ? 'success' : recipe.difficulty === 'medium' ? 'warning' : 'error'}
                sx={{ mr: 1 }}
              />
              <Chip
                label={`${recipe.servings}인분`}
              />
            </Box>

            {recipe.description && (
              <Typography variant="body1" paragraph>
                {recipe.description}
              </Typography>
            )}

            {!recipe.canCook && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>부족한 재료가 있습니다.</strong>
                <br />
                {recipe.missingIngredients.map(i => i.name).join(', ')}
              </Alert>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            {recipe.image_url && (
              <Box
                component="img"
                src={recipe.image_url}
                alt={recipe.name}
                sx={{ width: '100%', borderRadius: 2 }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* 재료 목록 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          재료
        </Typography>
        <Grid container spacing={2}>
          {recipe.recipeIngredients.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ListItemIcon>
                      <KitchenIcon />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body1">
                        {item.ingredient.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity}{item.ingredient.unit}
                        {item.is_optional && ' (선택)'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 조리 과정 */}
      {!cookingMode ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              조리 과정
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleStartCooking}
              startIcon={<RestaurantIcon />}
            >
              요리 시작
            </Button>
          </Box>
          <List>
            {recipe.instructions.map((step, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Chip label={index + 1} size="small" color="primary" />
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            요리 모드
          </Typography>
          <Stepper activeStep={completedSteps.length} orientation="vertical">
            {recipe.instructions.map((step, index) => (
              <Step key={index} completed={completedSteps.includes(index)}>
                <StepLabel>
                  단계 {index + 1}
                </StepLabel>
                <StepContent>
                  <Typography>{step}</Typography>
                  <Box sx={{ mb: 2, mt: 1 }}>
                    <Button
                      variant={completedSteps.includes(index) ? "outlined" : "contained"}
                      onClick={() => handleStepComplete(index)}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      {completedSteps.includes(index) ? '완료 취소' : '완료'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          
          {completedSteps.length === recipe.instructions.length && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                모든 단계를 완료했습니다!
              </Alert>
              <Button
                variant="contained"
                color="success"
                size="large"
                onClick={handleFinishCooking}
                startIcon={<CheckIcon />}
              >
                요리 완료 & 재료 차감
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* 부족한 재료 다이얼로그 */}
      <Dialog open={cookDialogOpen} onClose={() => setCookDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            부족한 재료가 있습니다
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            다음 재료가 부족합니다:
          </Typography>
          <List>
            {recipe.missingIngredients?.map((ingredient) => (
              <ListItem key={ingredient.id}>
                <ListItemText primary={ingredient.name} />
              </ListItem>
            ))}
          </List>
          <Typography>
            어떻게 진행하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCookDialogOpen(false)}>
            취소
          </Button>
          <Button 
            onClick={() => handleCookWithMissing(true)}
            startIcon={<ShoppingCartIcon />}
          >
            장보기 리스트에 추가하고 계속
          </Button>
          <Button 
            onClick={() => handleCookWithMissing(false)}
            variant="contained"
          >
            그냥 계속
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default RecipeDetail;