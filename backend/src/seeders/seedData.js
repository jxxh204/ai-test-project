const bcrypt = require('bcryptjs');
const { sequelize, User, Ingredient, Recipe, RecipeIngredient } = require('../models');

const seedData = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      email: 'test@example.com',
      password: hashedPassword,
      name: '테스트 사용자'
    });
    console.log('Test user created');

    // Create ingredients
    const ingredients = await Ingredient.bulkCreate([
      // 채소
      { name: '양파', category: 'vegetables', unit: '개', typical_shelf_life_days: 30 },
      { name: '당근', category: 'vegetables', unit: '개', typical_shelf_life_days: 14 },
      { name: '감자', category: 'vegetables', unit: '개', typical_shelf_life_days: 21 },
      { name: '대파', category: 'vegetables', unit: '대', typical_shelf_life_days: 7 },
      { name: '마늘', category: 'vegetables', unit: '쪽', typical_shelf_life_days: 30 },
      { name: '배추', category: 'vegetables', unit: '포기', typical_shelf_life_days: 7 },
      { name: '무', category: 'vegetables', unit: '개', typical_shelf_life_days: 14 },
      { name: '시금치', category: 'vegetables', unit: '단', typical_shelf_life_days: 3 },
      { name: '콩나물', category: 'vegetables', unit: 'g', typical_shelf_life_days: 3 },
      { name: '버섯', category: 'vegetables', unit: 'g', typical_shelf_life_days: 5 },
      
      // 과일
      { name: '사과', category: 'fruits', unit: '개', typical_shelf_life_days: 14 },
      { name: '바나나', category: 'fruits', unit: '개', typical_shelf_life_days: 5 },
      { name: '딸기', category: 'fruits', unit: 'g', typical_shelf_life_days: 3 },
      { name: '토마토', category: 'fruits', unit: '개', typical_shelf_life_days: 7 },
      
      // 육류
      { name: '돼지고기', category: 'meat', unit: 'g', typical_shelf_life_days: 3 },
      { name: '소고기', category: 'meat', unit: 'g', typical_shelf_life_days: 3 },
      { name: '닭고기', category: 'meat', unit: 'g', typical_shelf_life_days: 2 },
      { name: '계란', category: 'meat', unit: '개', typical_shelf_life_days: 30 },
      { name: '베이컨', category: 'meat', unit: 'g', typical_shelf_life_days: 7 },
      { name: '햄', category: 'meat', unit: 'g', typical_shelf_life_days: 5 },
      
      // 유제품
      { name: '우유', category: 'dairy', unit: 'ml', typical_shelf_life_days: 7 },
      { name: '치즈', category: 'dairy', unit: 'g', typical_shelf_life_days: 14 },
      { name: '버터', category: 'dairy', unit: 'g', typical_shelf_life_days: 30 },
      { name: '요거트', category: 'dairy', unit: '개', typical_shelf_life_days: 14 },
      
      // 곡물
      { name: '쌀', category: 'grains', unit: 'g', typical_shelf_life_days: 365 },
      { name: '밀가루', category: 'grains', unit: 'g', typical_shelf_life_days: 180 },
      { name: '빵', category: 'grains', unit: '개', typical_shelf_life_days: 3 },
      { name: '파스타', category: 'grains', unit: 'g', typical_shelf_life_days: 365 },
      { name: '라면', category: 'grains', unit: '개', typical_shelf_life_days: 180 },
      
      // 양념/조미료
      { name: '소금', category: 'spices', unit: 'g', typical_shelf_life_days: 9999 },
      { name: '후추', category: 'spices', unit: 'g', typical_shelf_life_days: 9999 },
      { name: '설탕', category: 'spices', unit: 'g', typical_shelf_life_days: 9999 },
      { name: '간장', category: 'condiments', unit: 'ml', typical_shelf_life_days: 365 },
      { name: '된장', category: 'condiments', unit: 'g', typical_shelf_life_days: 180 },
      { name: '고추장', category: 'condiments', unit: 'g', typical_shelf_life_days: 180 },
      { name: '식용유', category: 'condiments', unit: 'ml', typical_shelf_life_days: 365 },
      { name: '참기름', category: 'condiments', unit: 'ml', typical_shelf_life_days: 180 },
      { name: '식초', category: 'condiments', unit: 'ml', typical_shelf_life_days: 730 },
      { name: '케첩', category: 'condiments', unit: 'g', typical_shelf_life_days: 365 },
      { name: '마요네즈', category: 'condiments', unit: 'g', typical_shelf_life_days: 90 }
    ]);
    console.log('Ingredients created');

    // Create recipes
    const recipes = [
      {
        name: '김치찌개',
        description: '한국인의 소울푸드, 얼큰하고 시원한 김치찌개',
        instructions: [
          '돼지고기를 먹기 좋은 크기로 썰어주세요',
          '냄비에 참기름을 두르고 돼지고기를 볶아주세요',
          '고기가 익으면 김치를 넣고 함께 볶아주세요',
          '물을 넣고 끓여주세요',
          '된장, 고춧가루를 넣고 간을 맞춰주세요',
          '두부와 대파를 넣고 한소끔 더 끓여주세요'
        ],
        cooking_time_minutes: 30,
        difficulty: 'easy',
        servings: 2,
        tags: ['한식', '찌개', '매운맛']
      },
      {
        name: '계란볶음밥',
        description: '간단하고 맛있는 한끼 식사',
        instructions: [
          '당근, 양파, 햄을 잘게 썰어주세요',
          '팬에 기름을 두르고 계란을 스크램블로 만들어주세요',
          '계란을 덜어내고 같은 팬에 야채를 볶아주세요',
          '밥을 넣고 야채와 함께 볶아주세요',
          '간장으로 간을 하고 계란을 다시 넣어 섞어주세요',
          '대파를 송송 썰어 올려주세요'
        ],
        cooking_time_minutes: 15,
        difficulty: 'easy',
        servings: 1,
        tags: ['간편식', '볶음밥', '한끼식사']
      },
      {
        name: '파스타 아라비아따',
        description: '매콤한 토마토 소스 파스타',
        instructions: [
          '끓는 물에 소금을 넣고 파스타를 삶아주세요',
          '마늘을 다지고 올리브오일에 볶아주세요',
          '토마토를 넣고 으깨며 볶아주세요',
          '소금, 후추, 고춧가루로 간을 해주세요',
          '삶은 파스타를 소스에 넣고 섞어주세요',
          '접시에 담고 파슬리를 뿌려주세요'
        ],
        cooking_time_minutes: 20,
        difficulty: 'medium',
        servings: 2,
        tags: ['양식', '파스타', '매운맛']
      },
      {
        name: '된장찌개',
        description: '구수하고 건강한 된장찌개',
        instructions: [
          '육수를 끓여주세요 (물도 가능)',
          '감자, 양파, 호박을 먹기 좋게 썰어주세요',
          '된장을 육수에 풀어주세요',
          '감자를 먼저 넣고 끓여주세요',
          '양파, 호박, 두부를 넣고 끓여주세요',
          '대파, 청양고추를 넣고 마무리해주세요'
        ],
        cooking_time_minutes: 25,
        difficulty: 'easy',
        servings: 2,
        tags: ['한식', '찌개', '건강식']
      },
      {
        name: '스크램블 에그',
        description: '부드러운 스크램블 에그',
        instructions: [
          '계란을 그릇에 깨고 우유를 조금 넣어주세요',
          '소금, 후추로 간을 하고 잘 섞어주세요',
          '팬에 버터를 녹여주세요',
          '계란물을 붓고 약불에서 저어가며 익혀주세요',
          '계란이 부드럽게 익으면 불을 끄고 접시에 담아주세요',
          '빵과 함께 서빙하세요'
        ],
        cooking_time_minutes: 10,
        difficulty: 'easy',
        servings: 1,
        tags: ['양식', '아침식사', '간편식']
      }
    ];

    // Create recipes with ingredients
    for (const recipeData of recipes) {
      const recipe = await Recipe.create(recipeData);
      
      // Add recipe ingredients based on recipe
      if (recipe.name === '김치찌개') {
        await RecipeIngredient.bulkCreate([
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '돼지고기').id, quantity: 200 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '배추').id, quantity: 0.5 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '된장').id, quantity: 1 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '대파').id, quantity: 1 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '참기름').id, quantity: 1, is_optional: true }
        ]);
      } else if (recipe.name === '계란볶음밥') {
        await RecipeIngredient.bulkCreate([
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '계란').id, quantity: 2 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '쌀').id, quantity: 200 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '당근').id, quantity: 0.5 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '양파').id, quantity: 0.5 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '햄').id, quantity: 50, is_optional: true },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '간장').id, quantity: 2 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '식용유').id, quantity: 2 }
        ]);
      } else if (recipe.name === '파스타 아라비아따') {
        await RecipeIngredient.bulkCreate([
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '파스타').id, quantity: 200 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '토마토').id, quantity: 3 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '마늘').id, quantity: 3 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '식용유').id, quantity: 3 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '소금').id, quantity: 1 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '후추').id, quantity: 0.5 }
        ]);
      } else if (recipe.name === '된장찌개') {
        await RecipeIngredient.bulkCreate([
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '된장').id, quantity: 2 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '감자').id, quantity: 1 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '양파').id, quantity: 0.5 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '대파').id, quantity: 1 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '버섯').id, quantity: 50, is_optional: true }
        ]);
      } else if (recipe.name === '스크램블 에그') {
        await RecipeIngredient.bulkCreate([
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '계란').id, quantity: 3 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '우유').id, quantity: 30 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '버터').id, quantity: 10 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '소금').id, quantity: 0.5 },
          { recipe_id: recipe.id, ingredient_id: ingredients.find(i => i.name === '후추').id, quantity: 0.3 }
        ]);
      }
    }
    
    console.log('Recipes and recipe ingredients created');
    console.log('Seed data completed successfully!');
    
    console.log('\n테스트 계정 정보:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await sequelize.close();
  }
};

// Run seed if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;