package com.japantravel.service;

import com.japantravel.domain.User;
import com.japantravel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User register(String email, String encodedPassword, String nickname) {
        log.info("[UserService] register 시작 - email: {}", email);

        if (userRepository.existsByEmail(email)) {
            log.warn("[UserService] 이미 사용 중인 이메일 - email: {}", email);
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }
        if (userRepository.existsByNickname(nickname)) {
            log.warn("[UserService] 이미 사용 중인 닉네임 - nickname: {}", nickname);
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = User.builder()
                .email(email)
                .password(encodedPassword)
                .nickname(nickname)
                .build();

        User saved = userRepository.save(user);
        log.info("[UserService] register 완료 - userId: {}", saved.getUserId());
        return saved;
    }

    @Transactional(readOnly = true)
    public User getProfile(Long userId) {
        log.info("[UserService] getProfile 시작 - userId: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("[UserService] 존재하지 않는 사용자 - userId: {}", userId);
                    return new IllegalArgumentException("존재하지 않는 사용자입니다.");
                });

        log.info("[UserService] getProfile 완료 - userId: {}", userId);
        return user;
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        log.info("[UserService] findByEmail 시작 - email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("[UserService] 이메일로 사용자 조회 실패 - email: {}", email);
                    return new IllegalArgumentException("존재하지 않는 사용자입니다.");
                });

        log.info("[UserService] findByEmail 완료 - userId: {}", user.getUserId());
        return user;
    }
}
