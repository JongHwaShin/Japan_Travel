# 🗾 일본여행 앱 (Japan Travel)

일본 여행 정보를 한곳에서! 맛집·관광지 탐색부터 여행일기, 교통정보, 환율계산까지 제공하는 웹 서비스입니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🏙️ 도시별 상세 페이지 | 7개 도시 카드 선택 → 도시별 장소 카테고리 탭 탐색 |
| 🍜 맛집/관광지/숙박 | 지역·카테고리별 필터링 (맛집·관광지·카페·쇼핑·숙박), 상세 정보 및 지도 연동 |
| 📝 여행일기 | 일기 작성, 좋아요·댓글 기능 |
| 🚃 교통정보 | 지역별 JR·지하철·버스·공항버스·택시 정보 |
| 💴 환율계산기 | 실시간 엔/원 환율 조회 및 양방향 계산기 |
| 🔐 JWT 인증 | 로그인/회원가입, 자동로그인, Access Token + Refresh Token 자동 갱신 |

---

## 🗾 지원 도시

후쿠오카 · 오사카 · 도쿄 · 교토 · 삿포로 · 요코하마 · 나고야

---

## 🛠 기술 스택

### Backend
- **Java 17** + **Spring Boot 3.2.5**
- **Spring Security** + **Spring Data JPA**
- **MariaDB** — DB명: `japan_travel`
- **JWT** — jjwt 0.11.5 (Access 1h / Refresh 30d)
- **Swagger** — SpringDoc OpenAPI 2.3.0
- **Logback** — 로그 파일 관리

### Frontend
- **React 18** + **Vite** (포트 3000)
- **Tailwind CSS** — 반응형 디자인 (모바일/태블릿/PC)
- **TanStack Query v5** — 서버 상태 캐싱
- **Zustand** — 클라이언트 인증 상태
- **React Hook Form** + **Axios**

---

## 📁 프로젝트 구조

```
japan-travel/
├── backend/
│   └── src/main/java/com/japantravel/
│       ├── controller/      # REST 컨트롤러
│       ├── service/         # 비즈니스 로직
│       ├── repository/      # JPA Repository
│       ├── domain/          # Entity + Enum
│       ├── dto/             # Request/Response DTO
│       ├── security/        # JWT 필터
│       ├── global/          # 전역 예외처리
│       └── config/          # Security, Swagger 설정
└── frontend/
    └── src/
        ├── api/             # Axios 인스턴스
        ├── components/      # 공통 컴포넌트
        ├── hooks/           # 커스텀 훅
        ├── pages/           # 라우트 페이지
        └── store/           # Zustand 스토어
```

---

## 🔑 환경변수 설정

### 백엔드 (`backend/.env`)

```env
# Google Places API 키 (필수 — 없으면 서버 시작 실패)
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# JWT 시크릿 (32자 이상 필수)
JWT_SECRET=your_jwt_secret_key_must_be_32_chars_minimum
```

> `backend/.env` 파일은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

### 프론트엔드 (`frontend/.env`)

```env
# 백엔드 API 주소 (로컬 개발 시 생략 가능, 기본값: http://localhost:8080)
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🚀 실행 방법

### 사전 준비
- Java 17+
- Node.js 18+
- MariaDB (DB명: `japan_travel`, 포트 3306)

### 백엔드

```bash
cd backend

# 1. 환경변수 파일 생성
cp .env.example .env   # 또는 직접 backend/.env 생성 후 위 환경변수 입력

# 2. DB 스키마 초기화
# schema.sql 을 MariaDB에 직접 실행

# 3. 서버 실행
./gradlew bootRun
```

> 서버 실행 후 → http://localhost:8080

### 프론트엔드

```bash
cd frontend

# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

> 브라우저에서 → http://localhost:3000

---

## 📖 API 문서

Swagger UI: **http://localhost:8080/swagger-ui/index.html**

### 주요 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| GET | `/api/regions` | 지역 목록 |
| GET | `/api/places` | 맛집/관광지 목록 |
| GET | `/api/places/{id}` | 장소 상세 |
| GET | `/api/logs` | 여행일기 목록 |
| POST | `/api/logs` | 일기 작성 |
| POST | `/api/logs/{id}/like` | 좋아요 토글 |
| GET | `/api/transport` | 교통정보 |
| GET | `/api/exchange` | 환율 조회 |

---

## 📱 반응형 브레이크포인트

| 구간 | 범위 | 레이아웃 |
|------|------|----------|
| 모바일 | ~768px | 하단 네비게이션, 1열 카드 |
| 태블릿 | 768px~1024px | 하단 네비게이션, 2열 카드 |
| PC | 1024px~ | 상단 헤더 + 좌측 사이드바, 3열 카드 |

---

## 📌 버전 히스토리

### v1.0.4 (2026-04-07)
- 👤 프로필 페이지 추가 (`/profile`) — 닉네임 수정, 비밀번호 변경, 회원 탈퇴
- 🖼️ 프로필 이미지 파일 업로드 기능 (MultipartFile → `./uploads/profiles/` 저장)
- ✏️ 여행일기 수정/삭제 기능 추가 (상세 페이지 점 세 개 메뉴)
- 📝 여행일기 수정 페이지 추가 (`/logs/:id/edit`)
- 🐛 `GET /api/users/me` 500 에러 수정 (서버 미재시작으로 라우트 미등록 → `NoResourceFoundException` 500 처리 개선)
- 🐛 수정 페이지 흰 화면 수정 (라우트 미등록 문제)
- 🐛 닉네임 미표시 버그 수정 (LoginResponse `userId` 누락 → authStore `user.id` 미설정)
- 🔒 `SecurityConfig` `/api/users/me` 정확한 경로 인증 처리 추가

### v1.0.3 (2026-04-03)
- 🛡️ Rate Limiting 추가 (Bucket4j, IP당 1분 60회 / 로그인 10회 / Places·환율 30회)
- 🔐 로그인 브루트포스 차단 (5회 실패 시 30분 차단, LoginAttemptService)
- 🔒 HTTP 보안 헤더 추가 (X-Frame-Options, XSS-Protection, CSP, HSTS, Referrer-Policy)
- ✅ 회원가입 입력값 검증 강화 (비밀번호 영문+숫자 조합 `@Pattern`)
- 🐳 Docker 배포 환경 구성 (backend/frontend Dockerfile, docker-compose.yml, application-prod.yml)
- 🌐 axios baseURL 동적 설정 (접속 호스트 자동 감지, IP 변경 대응)
- ☰ 헤더 햄버거 사이드바 추가 (슬라이드 애니메이션, 오버레이, 로그인/로그아웃)
- 🐛 모바일 viewport 화면 확대 버그 수정 (`maximum-scale=1.0, user-scalable=no`)
- 🔓 `/api/auth/**` 전체 permitAll 적용 (로그인 403 버그 수정)
- 🐛 프론트 API 경로 `/api` prefix 누락 전체 수정 (21개 호출)

### v1.0.2 (2026-03-31)
- 🖼️ 장소 이미지 연동 (place_images 테이블, is_main 구분)
- 📄 장소 목록 페이지네이션 적용 (page/size 파라미터)
- 🐛 이미지 없는 장소 빈 리스트 처리 (fallback 방어 코드)

### v1.0.1 (2026-03-30)
- 🏙️ 도시별 상세 페이지 추가 (`/city/:regionId`) — 카테고리 탭, 스켈레톤 로딩
- 🛏️ 숙박 카테고리 추가 (PlaceCategory enum + DB ENUM + 프론트 필터)
- 🔐 자동로그인 체크박스 추가 (localStorage / sessionStorage 분리)
- 🖼️ 도시 카드 이미지 교체 (실제 랜드마크 사진으로 변경)
- 🐛 도시 상세 페이지 전체 탭 데이터 조회 오류 수정
- 🐛 PlaceCategory enum 숙박 누락 수정

### v1.0.0 (2026-03-27)
- 🎉 초기 릴리즈
- 백엔드: JWT 인증, 맛집/관광지, 여행일기 CRUD, 교통정보, 환율 API
- 프론트엔드: 전체 페이지 구현 (홈·목록·상세·작성·교통·환율)
