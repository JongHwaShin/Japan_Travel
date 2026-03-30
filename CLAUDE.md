# 🗾 일본여행 앱 (Japan Travel)

## 프로젝트 개요
일본 여행 정보를 제공하는 웹 + iOS 앱 서비스
iOS는 별도 Xcode에서 개발, 여기선 Backend + Frontend만 관리

---

## 기술 스택

### Backend
- Java 17 + Spring Boot 3.2.5
- Spring Security + Spring Data JPA + Bean Validation
- Lombok
- MariaDB (DB명: japan_travel, 포트 3306)
- JWT: jjwt 0.11.5 (accessToken 1시간 / refreshToken 30일)
- Swagger: SpringDoc OpenAPI 2.3.0 → http://localhost:8080/swagger-ui/index.html
- 빌드: Gradle / 패키지: com.japantravel

### Frontend
- React 18 + Vite (포트 3000)
- Tailwind CSS (디자인 시스템)
- TanStack Query v5 — 서버 상태 캐싱
- Zustand — 클라이언트 상태 (인증)
- React Hook Form — 폼 관리
- Axios — API 통신 (/api/* → :8080 프록시)

---

## 폴더 구조

```
japan-travel/
├── backend/
│   └── src/main/java/com/japantravel/
│       ├── controller/      → REST 컨트롤러
│       ├── service/         → 비즈니스 로직
│       ├── repository/      → JPA Repository
│       ├── domain/          → Entity + enums/
│       ├── dto/             → request/response DTO
│       ├── security/        → JWT 필터, UserPrincipal
│       ├── global/          → GlobalExceptionHandler
│       └── config/          → SecurityConfig, SwaggerConfig, RestTemplateConfig
└── frontend/
    └── src/
        ├── api/             → axios 인스턴스
        ├── components/      → 공통 컴포넌트 (home/ 서브폴더 포함)
        ├── hooks/           → 커스텀 훅
        ├── pages/           → 라우트 페이지
        └── store/           → Zustand 스토어
```

---

## API 엔드포인트

### 인증 (공개)
| Method | URL | 설명 |
|--------|-----|------|
| POST | /api/auth/signup | 회원가입 |
| POST | /api/auth/login | 로그인 → accessToken, refreshToken 반환 |
| POST | /api/auth/refresh | 토큰 갱신 |
| POST | /api/auth/logout | 로그아웃 (인증 필요) |

### 지역
| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/regions | 전체 지역 목록 |
| GET | /api/regions/{id} | 지역 상세 |

### 장소
| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/places | 목록 (쿼리: regionId, category) |
| GET | /api/places/{id} | 장소 상세 |

### 여행일기
| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/logs | 공개 일기 목록 (최신순) |
| GET | /api/logs/my | 내 일기 목록 (인증 필요) |
| GET | /api/logs/{id} | 상세 (비로그인 허용, 조회수 증가) |
| POST | /api/logs | 작성 (인증 필요) |
| PUT | /api/logs/{id} | 수정 (본인만) |
| DELETE | /api/logs/{id} | 삭제 (본인만) |
| POST | /api/logs/{id}/like | 좋아요 토글 (인증 필요) |
| POST | /api/logs/{id}/comments | 댓글 작성 (인증 필요) |

### 교통 / 환율
| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/transport | 전체 교통정보 |
| GET | /api/transport/{regionId} | 지역별 교통정보 |
| GET | /api/exchange?from=KRW&to=JPY | 환율 조회 |

---

## 도메인 Enum

| Enum | 값 |
|------|----|
| PlaceCategory | 맛집, 관광지, 카페, 쇼핑, 숙박 |
| PriceRange | LOW(₩), MEDIUM(₩₩), HIGH(₩₩₩) |
| TransportType | JR, 지하철, 버스, 공항버스, 택시 |

---

## DB 주요 정보

**ddl-auto: validate** — 스키마 자동 변경 없음, `schema.sql`로 직접 관리

**스키마 변경 이력**
- v1.1: `users` 테이블에 `refresh_token VARCHAR(500)` 컬럼 추가
- v1.2: `places` 테이블 `category` ENUM에 `숙박` 추가

**DB 테이블 목록**
- users (회원, refresh_token 컬럼 포함)
- regions (지역, name_ko / name_jp)
- places (맛집/관광지)
- place_images (장소 이미지, is_main 구분)
- travel_logs (여행 일기, is_public / view_count)
- log_images (일기 이미지)
- comments (댓글)
- likes (좋아요, log_id+user_id UNIQUE)
- transport_info (교통 정보)
- exchange_rates (환율 캐시)

---

## API 응답 형태 통일

```json
{
  "success": true,
  "message": "성공",
  "data": {}
}
```
목록 API는 `data`가 배열 (List) 형태로 반환 — 현재 페이지네이션 미적용

---

## 프론트엔드 라우트

| 경로 | 페이지 | 인증 필요 |
|------|--------|-----------|
| / | 홈 | X |
| /login | 로그인 | X |
| /signup | 회원가입 | X |
| /places | 맛집/관광지 목록 | X |
| /places/:id | 장소 상세 | X |
| /city/:regionId | 도시 상세 (장소 카테고리 탭) | X |
| /logs | 여행일기 목록 | X |
| /logs/:id | 일기 상세 | X |
| /transport | 교통정보 | X |
| /exchange | 환율 계산기 | X |
| /profile | 프로필 | O |

---

## 인증 흐름
- accessToken, refreshToken → localStorage 저장
- Zustand authStore → user, isLoggedIn 상태 (persist)
- axios 인터셉터 → 요청마다 Authorization: Bearer 자동 주입
- 401 응답 → 토큰 삭제 후 /login 리다이렉트
- PrivateRoute → isLoggedIn false면 /login redirect

---

## 반응형 브레이크포인트
- 모바일  : ~768px  (하단 네비게이션, 1열 카드)
- 태블릿  : 768px~1024px (하단 네비게이션, 2열 카드)
- PC      : 1024px~ (상단 헤더 네비 + 좌측 사이드바, 3열 카드, 하단탭 숨김)

---

## 코딩 컨벤션

### 공통
- 변수/메서드명 : camelCase
- 클래스명      : PascalCase
- API 방식      : RESTful
- 예외처리      : GlobalExceptionHandler

### Frontend
- 페이지 컴포넌트   : src/pages/
- 공통 컴포넌트     : src/components/
- 페이지 전용 섹션  : src/components/{페이지명}/
- react-query queryKey 형식: ['리소스', '용도', ...파라미터]

---

## 개발 버전
- v1.0 : 맛집/관광지, 여행일기, 교통정보, 환율계산기
- v2.0 : AI 여행 플래너 (Claude API 연동 예정)
