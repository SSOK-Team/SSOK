# SSOK — 자취방 가구 배치 시뮬레이터

내 방 사진을 올리면, 가구를 가상으로 배치해볼 수 있는 웹 서비스입니다.

<br>

## 프로젝트 소개

**SSOK**은 내 방 사진 위에 가구를 올려놓고 드래그·회전·크기 조절을 통해 실제로 배치했을 때의 모습을 미리 확인할 수 있는 서비스입니다.

<br>

## 주요 기능

- **방 사진 업로드** — 내 방 사진을 캔버스 배경으로 설정
- **가구 배치** — 침대, 책상, 소파 등 가구를 드래그해서 자유롭게 배치
- **회전 및 크기 조절** — 가구를 회전하고 크기를 조절해 동선 확인
- **실제 치수 반영** — 픽셀과 실제 cm를 매칭해 정확한 배치 시뮬레이션
- **배경 제거** — 직접 찍은 가구 사진의 배경을 자동으로 제거

<br>

## 기술 스택

### Frontend
- React
- Konva.js (react-konva)

### Backend
- Node.js
- Express

### Database
- PostgreSQL

### External API
- Remove.bg (가구 이미지 배경 제거)

<br>

## 프로젝트 구조

```
SSOK/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/       # 재사용 컴포넌트
│       │   ├── Canvas/       # Konva 캔버스 관련
│       │   ├── Sidebar/      # 가구 선택 사이드바
│       │   └── Upload/       # 사진 업로드
│       ├── pages/            # 페이지 단위
│       ├── hooks/            # 커스텀 훅
│       ├── api/              # 백엔드 API 호출
│       └── App.js
├── backend/
│   └── src/
│       ├── routes/           # API 라우터
│       ├── controllers/      # 비즈니스 로직
│       ├── models/           # DB 모델
│       ├── middlewares/      # 미들웨어
│       └── app.js
└── docs/                     # 설계 문서
```

<br>

## 브랜치 전략

| 브랜치 | 설명 |
|--------|------|
| `main` | 배포용 브랜치 |
| `develop` | 개발 통합 브랜치 |
| `feature/xxx` | 기능 개발 브랜치 |

<br>

## 커밋 컨벤션

| 태그 | 설명 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `chore` | 설정, 패키지 등 |
| `refactor` | 코드 리팩토링 |

<br>

## 실행 방법

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```