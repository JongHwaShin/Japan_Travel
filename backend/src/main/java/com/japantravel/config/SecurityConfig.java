package com.japantravel.config;

import com.japantravel.global.filter.RateLimitFilter;
import com.japantravel.security.CustomUserDetailsService;
import com.japantravel.security.JwtAuthenticationFilter;
import com.japantravel.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RateLimitFilter rateLimitFilter() {
        return new RateLimitFilter();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, customUserDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (REST API)
            .csrf(AbstractHttpConfigurer::disable)

            // 보안 헤더
            .headers(headers -> headers
                // X-Content-Type-Options: nosniff (MIME 스니핑 방지)
                .contentTypeOptions(contentType -> {})
                // X-Frame-Options: DENY (클릭재킹 방지)
                .frameOptions(frame -> frame.deny())
                // X-XSS-Protection: 1; mode=block
                .xssProtection(xss -> {})
                // Strict-Transport-Security (HTTPS 강제, 1년)
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000))
                // Content-Security-Policy
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives(
                        "default-src 'self'; " +
                        "script-src 'self'; " +
                        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                        "font-src 'self' https://fonts.gstatic.com; " +
                        "img-src 'self' data: https:; " +
                        "connect-src 'self'; " +
                        "frame-ancestors 'none'"
                    ))
                // Referrer-Policy: strict-origin-when-cross-origin
                .referrerPolicy(referrer -> referrer
                    .policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            )

            // CORS 설정
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 세션 STATELESS
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 요청 권한 설정
            .authorizeHttpRequests(auth -> auth
                // 인증 없이 허용
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/places/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/regions/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/transport/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/exchange/**").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/logs/**").permitAll()
                // Swagger UI
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // 관리자 API
                .requestMatchers("/api/admin/**").authenticated()
                // 나머지는 인증 필요
                .anyRequest().authenticated()
            )

            // RateLimitFilter → JwtAuthenticationFilter → UsernamePasswordAuthenticationFilter 순으로 등록
            .addFilterBefore(rateLimitFilter(), UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // React 개발 서버 (개발 환경 — 전체 허용)
        config.setAllowedOriginPatterns(List.of("*"));
        // iOS 앱은 브라우저가 아니므로 CORS 제약 없음
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
