package com.japantravel.controller;

import com.japantravel.dto.auth.LoginRequest;
import com.japantravel.dto.auth.LoginResponse;
import com.japantravel.dto.auth.RefreshRequest;
import com.japantravel.dto.auth.SignupRequest;
import com.japantravel.dto.common.ApiResponse;
import com.japantravel.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ApiResponse<Void> signup(@Valid @RequestBody SignupRequest request) {
        log.info("[AuthController] POST /api/auth/signup - email: {}", request.getEmail());
        authService.signup(request);
        return ApiResponse.ok("회원가입이 완료되었습니다.");
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                            HttpServletRequest httpRequest) {
        String ip = resolveClientIp(httpRequest);
        log.info("[AuthController] POST /api/auth/login - email: {}, IP: {}", request.getEmail(), ip);
        LoginResponse response = authService.login(request, ip);
        return ApiResponse.ok("로그인 성공", response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        log.info("[AuthController] POST /api/auth/refresh");
        LoginResponse response = authService.refresh(request);
        return ApiResponse.ok("토큰이 갱신되었습니다.", response);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("[AuthController] POST /api/auth/logout - email: {}", userDetails.getUsername());
        authService.logout(userDetails.getUsername());
        return ApiResponse.ok("로그아웃되었습니다.");
    }
}
