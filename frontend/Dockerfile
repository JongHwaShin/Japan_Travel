# ── 1단계: 빌드 ──────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 캐시 레이어
COPY package.json package-lock.json ./
RUN npm ci --silent

# 소스 복사 후 빌드
COPY . .
RUN npm run build

# ── 2단계: Nginx 서빙 ────────────────────────────────────────────────────────
FROM nginx:alpine

# 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# React Router SPA 대응 nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
