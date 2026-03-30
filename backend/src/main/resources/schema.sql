-- ========================
-- 일본여행 앱 DB 스키마
-- ========================

CREATE DATABASE IF NOT EXISTS japan_travel
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE japan_travel;

-- 회원
CREATE TABLE users (
    user_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    email          VARCHAR(100) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    nickname       VARCHAR(50)  NOT NULL,
    profile_image  VARCHAR(500),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 지역
CREATE TABLE regions (
    region_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    name_ko        VARCHAR(50) NOT NULL,
    name_jp        VARCHAR(50),
    description    TEXT
);

-- 장소 (맛집/관광지)
CREATE TABLE places (
    place_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    region_id      BIGINT NOT NULL,
    category       ENUM('맛집','관광지','카페','쇼핑','숙박') NOT NULL,
    name_ko        VARCHAR(100) NOT NULL,
    name_jp        VARCHAR(100),
    address        VARCHAR(255),
    latitude       DECIMAL(10,7),
    longitude      DECIMAL(10,7),
    description    TEXT,
    open_hours     VARCHAR(100),
    price_range    ENUM('₩','₩₩','₩₩₩'),
    rating         DECIMAL(2,1),
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

-- 장소 이미지
CREATE TABLE place_images (
    image_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    place_id       BIGINT NOT NULL,
    image_url      VARCHAR(500) NOT NULL,
    is_main        BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (place_id) REFERENCES places(place_id)
);

-- 여행 일기
CREATE TABLE travel_logs (
    log_id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    region_id      BIGINT,
    title          VARCHAR(200) NOT NULL,
    content        LONGTEXT NOT NULL,
    travel_date    DATE,
    is_public      BOOLEAN DEFAULT TRUE,
    view_count     INT DEFAULT 0,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(user_id),
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

-- 일기 이미지
CREATE TABLE log_images (
    image_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_id         BIGINT NOT NULL,
    image_url      VARCHAR(500) NOT NULL,
    FOREIGN KEY (log_id) REFERENCES travel_logs(log_id)
);

-- 댓글
CREATE TABLE comments (
    comment_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_id         BIGINT NOT NULL,
    user_id        BIGINT NOT NULL,
    content        TEXT NOT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id)  REFERENCES travel_logs(log_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 좋아요
CREATE TABLE likes (
    like_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_id         BIGINT NOT NULL,
    user_id        BIGINT NOT NULL,
    UNIQUE KEY unique_like (log_id, user_id),
    FOREIGN KEY (log_id)  REFERENCES travel_logs(log_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 교통 정보
CREATE TABLE transport_info (
    transport_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    region_id      BIGINT,
    type           ENUM('JR','지하철','버스','공항버스','택시') NOT NULL,
    name_ko        VARCHAR(100) NOT NULL,
    name_jp        VARCHAR(100),
    description    TEXT,
    price          VARCHAR(100),
    tip            TEXT,
    FOREIGN KEY (region_id) REFERENCES regions(region_id)
);

-- 환율 캐시
CREATE TABLE exchange_rates (
    rate_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_currency  VARCHAR(10) NOT NULL,
    to_currency    VARCHAR(10) NOT NULL,
    rate           DECIMAL(10,4) NOT NULL,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ========================
-- 스키마 변경 이력
-- ========================

-- v1.1: refresh_token 컬럼 추가
ALTER TABLE users ADD COLUMN refresh_token VARCHAR(500);

-- v1.2: places category ENUM에 '숙박' 추가
ALTER TABLE places
MODIFY COLUMN category ENUM('맛집','관광지','카페','쇼핑','숙박') NOT NULL;
