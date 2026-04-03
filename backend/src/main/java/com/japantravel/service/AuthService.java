package com.japantravel.service;

import com.japantravel.domain.User;
import com.japantravel.dto.auth.LoginRequest;
import com.japantravel.dto.auth.LoginResponse;
import com.japantravel.dto.auth.RefreshRequest;
import com.japantravel.dto.auth.SignupRequest;
import com.japantravel.global.exception.LoginBlockedException;
import com.japantravel.repository.UserRepository;
import com.japantravel.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final LoginAttemptService loginAttemptService;

    @Transactional
    public void signup(SignupRequest request) {
        log.info("[AuthService] signup 시작 - email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("[AuthService] 이메일 중복 - email: {}", request.getEmail());
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        if (userRepository.existsByNickname(request.getNickname())) {
            log.warn("[AuthService] 닉네임 중복 - nickname: {}", request.getNickname());
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        userRepository.save(user);
        log.info("[AuthService] signup 완료 - email: {}", request.getEmail());
    }

    @Transactional
    public LoginResponse login(LoginRequest request, String ip) {
        log.info("[AuthService] login 시작 - email: {}, IP: {}", request.getEmail(), ip);

        // 브루트포스 차단 확인
        if (loginAttemptService.isBlocked(ip)) {
            throw new LoginBlockedException("로그인 시도 횟수 초과. 30분 후 다시 시도해주세요.");
        }

        User user;
        try {
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
            }
        } catch (IllegalArgumentException e) {
            loginAttemptService.loginFailed(ip);
            log.warn("[AuthService] 로그인 실패 - email: {}, IP: {}", request.getEmail(), ip);
            throw e;
        }

        // 로그인 성공 - 실패 기록 초기화
        loginAttemptService.loginSucceeded(ip);

        String accessToken  = jwtTokenProvider.generateAccessToken(user.getUserId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId(), user.getEmail());

        user.updateRefreshToken(refreshToken);
        log.info("[AuthService] login 완료 - userId: {}", user.getUserId());

        return LoginResponse.of(accessToken, refreshToken, user.getNickname());
    }

    @Transactional
    public LoginResponse refresh(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            log.warn("[AuthService] refresh 실패 - 유효하지 않은 refresh token");
            throw new IllegalArgumentException("유효하지 않은 Refresh Token입니다.");
        }

        Long userId = jwtTokenProvider.getUserId(refreshToken);
        String email = jwtTokenProvider.getEmail(refreshToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("[AuthService] refresh 실패 - 존재하지 않는 userId: {}", userId);
                    return new IllegalArgumentException("사용자를 찾을 수 없습니다.");
                });

        if (!refreshToken.equals(user.getRefreshToken())) {
            log.warn("[AuthService] refresh 실패 - DB의 refresh token과 불일치, userId: {}", userId);
            throw new IllegalArgumentException("Refresh Token이 일치하지 않습니다.");
        }

        String newAccessToken  = jwtTokenProvider.generateAccessToken(userId, email);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId, email);

        user.updateRefreshToken(newRefreshToken);
        log.info("[AuthService] refresh 완료 - userId: {}", userId);

        return LoginResponse.of(newAccessToken, newRefreshToken, user.getNickname());
    }

    @Transactional
    public void logout(String email) {
        log.info("[AuthService] logout 시작 - email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        user.updateRefreshToken(null);
        log.info("[AuthService] logout 완료 - email: {}", email);
    }
}
