package com.japantravel.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final String TOKEN_TYPE_CLAIM = "type";
    private static final String ACCESS  = "access";
    private static final String REFRESH = "refresh";

    private final Key secretKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration}") long accessExpirationMs,
            @Value("${jwt.refresh-expiration}") long refreshExpirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs  = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    /** Access Token 생성 (1시간) */
    public String generateAccessToken(Long userId, String email) {
        return buildToken(userId, email, ACCESS, accessExpirationMs);
    }

    /** Refresh Token 생성 (30일) */
    public String generateRefreshToken(Long userId, String email) {
        return buildToken(userId, email, REFRESH, refreshExpirationMs);
    }

    /** 토큰에서 userId 추출 */
    public Long getUserId(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    /** 토큰에서 이메일 추출 */
    public String getEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    /** Access Token 유효성 검증 */
    public boolean validateToken(String token) {
        return validate(token, ACCESS);
    }

    /** Refresh Token 유효성 검증 */
    public boolean validateRefreshToken(String token) {
        return validate(token, REFRESH);
    }

    public long getAccessExpirationSeconds() {
        return accessExpirationMs / 1000;
    }

    public long getRefreshExpirationSeconds() {
        return refreshExpirationMs / 1000;
    }

    // ─────────────────────────────────────────────
    // private
    // ─────────────────────────────────────────────

    private String buildToken(Long userId, String email, String type, long expirationMs) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .claim(TOKEN_TYPE_CLAIM, type)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + expirationMs))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    private boolean validate(String token, String expectedType) {
        try {
            Claims claims = parseClaims(token);
            if (!expectedType.equals(claims.get(TOKEN_TYPE_CLAIM, String.class))) {
                log.warn("[JwtTokenProvider] 토큰 타입 불일치 - expected: {}, actual: {}",
                        expectedType, claims.get(TOKEN_TYPE_CLAIM));
                return false;
            }
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("[JwtTokenProvider] 만료된 {} 토큰 - {}", expectedType, e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("[JwtTokenProvider] 지원하지 않는 토큰 형식 - {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("[JwtTokenProvider] 잘못된 토큰 구조 - {}", e.getMessage());
        } catch (SecurityException e) {
            log.warn("[JwtTokenProvider] 토큰 서명 불일치 - {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("[JwtTokenProvider] 빈 토큰 - {}", e.getMessage());
        }
        return false;
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
