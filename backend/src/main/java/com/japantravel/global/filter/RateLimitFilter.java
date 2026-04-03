package com.japantravel.global.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.japantravel.dto.common.ApiResponse;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    // IP별 버킷 저장소
    private final Map<String, Bucket> loginBuckets   = new ConcurrentHashMap<>();
    private final Map<String, Bucket> googleBuckets  = new ConcurrentHashMap<>();
    private final Map<String, Bucket> generalBuckets = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    // 로그인: 1분에 10회
    private Bucket loginBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
                .build();
    }

    // Google Places 포함 API: 1분에 30회
    private Bucket googleBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(30, Refill.intervally(30, Duration.ofMinutes(1))))
                .build();
    }

    // 일반 API: 1분에 60회
    private Bucket generalBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(60, Refill.intervally(60, Duration.ofMinutes(1))))
                .build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String ip  = resolveClientIp(request);
        String uri = request.getRequestURI();

        Bucket bucket = resolveBucket(ip, uri);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("[RateLimitFilter] 요청 초과 - IP: {}, URI: {}", ip, uri);
            sendTooManyRequests(response);
        }
    }

    /** URI에 따라 적절한 버킷 선택 */
    private Bucket resolveBucket(String ip, String uri) {
        if (uri.equals("/api/auth/login")) {
            return loginBuckets.computeIfAbsent(ip, k -> loginBucket());
        }
        if (uri.startsWith("/api/places") || uri.startsWith("/api/exchange")) {
            return googleBuckets.computeIfAbsent(ip, k -> googleBucket());
        }
        return generalBuckets.computeIfAbsent(ip, k -> generalBucket());
    }

    /** X-Forwarded-For 헤더 우선 적용 (프록시/로드밸런서 환경 대응) */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendTooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                objectMapper.writeValueAsString(
                        ApiResponse.fail("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.")
                )
        );
    }
}
