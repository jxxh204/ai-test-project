# FridgeChef - 냉장고 재료 관리 및 레시피 추천 서비스

FridgeChef는 1인 가구를 위한 냉장고 재료 관리 및 레시피 추천 웹 애플리케이션입니다. 유통기한이 임박한 재료를 우선적으로 활용하는 레시피를 추천하여 음식물 낭비를 줄이고 효율적인 요리를 도와줍니다.

## 주요 기능

- 📦 **재료 관리**: 냉장고, 냉동실, 실온 보관 재료를 체계적으로 관리
- ⏰ **유통기한 알림**: 유통기한이 임박한 재료를 실시간으로 알림
- 🍳 **레시피 추천**: 보유한 재료를 기반으로 맞춤형 레시피 추천
- 🛒 **장보기 리스트**: 부족한 재료를 자동으로 장보기 리스트에 추가
- 📱 **반응형 디자인**: 모바일에서도 편리하게 사용 가능

## 기술 스택

### Frontend
- React 18
- Vite
- Material-UI
- React Router
- Axios
- Context API

### Backend
- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT Authentication

## 시작하기

### 필수 요구사항
- Node.js 16.0.0 이상
- PostgreSQL 12 이상
- npm 또는 yarn

### 설치 및 실행

1. **프로젝트 클론**
```bash
git clone [repository-url]
cd fridgechef
```

2. **백엔드 설정**
```bash
cd backend
npm install
cp .env.example .env
# .env 파일을 열어 데이터베이스 설정 수정
```

3. **데이터베이스 설정**
```bash
# PostgreSQL에서 데이터베이스 생성
createdb fridgechef_dev

# 시드 데이터 실행
npm run seed
```

4. **백엔드 실행**
```bash
npm run dev
# 서버가 http://localhost:3001 에서 실행됩니다
```

5. **프론트엔드 설정 및 실행** (새 터미널)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# 애플리케이션이 http://localhost:5173 에서 실행됩니다
```

## 테스트 계정

시드 데이터 실행 후 다음 계정으로 로그인할 수 있습니다:
- Email: test@example.com
- Password: password123

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 재료 관리
- `GET /api/ingredients` - 전체 재료 목록
- `GET /api/ingredients/search` - 재료 검색
- `GET /api/user-ingredients` - 사용자 재료 목록
- `GET /api/user-ingredients/expiring` - 임박 재료 목록
- `POST /api/user-ingredients` - 재료 추가
- `PUT /api/user-ingredients/:id` - 재료 수정
- `DELETE /api/user-ingredients/:id` - 재료 삭제

### 레시피
- `GET /api/recipes` - 전체 레시피 목록
- `GET /api/recipes/recommendations` - 추천 레시피
- `GET /api/recipes/:id` - 레시피 상세
- `POST /api/recipes/:id/cook` - 요리 완료

### 장보기 리스트
- `GET /api/shopping-list` - 장보기 리스트
- `POST /api/shopping-list` - 항목 추가
- `PUT /api/shopping-list/:id` - 항목 수정
- `DELETE /api/shopping-list/:id` - 항목 삭제
- `POST /api/shopping-list/:id/purchase` - 구매 완료

## 프로젝트 구조

```
fridgechef/
├── frontend/                # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── context/        # Context API 상태 관리
│   │   ├── services/       # API 서비스
│   │   └── App.jsx         # 메인 앱 컴포넌트
│   └── package.json
├── backend/                 # Node.js 백엔드
│   ├── src/
│   │   ├── controllers/    # API 컨트롤러
│   │   ├── models/         # Sequelize 모델
│   │   ├── routes/         # Express 라우트
│   │   ├── services/       # 비즈니스 로직
│   │   ├── middleware/     # 미들웨어
│   │   └── server.js       # 서버 진입점
│   └── package.json
└── README.md
```

## 개발 가이드

### 코드 스타일
- ESLint 사용
- Prettier 권장
- 함수형 컴포넌트와 React Hooks 사용
- async/await 패턴 사용

### Git 커밋 메시지
- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- test: 테스트 추가
- chore: 빌드 업무 수정

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request