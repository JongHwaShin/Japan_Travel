package com.japantravel.service;

import com.japantravel.domain.User;
import com.japantravel.dto.user.UserProfileResponse;
import com.japantravel.repository.CommentRepository;
import com.japantravel.repository.LikeRepository;
import com.japantravel.repository.LogImageRepository;
import com.japantravel.repository.TravelLogRepository;
import com.japantravel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final TravelLogRepository travelLogRepository;
    private final LogImageRepository logImageRepository;

    @Value("${file.upload.path}")
    private String uploadPath;

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

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(String email) {
        log.info("[UserService] getMyProfile 시작 - email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("[UserService] 존재하지 않는 사용자 - email: {}", email);
                    return new IllegalArgumentException("존재하지 않는 사용자입니다.");
                });

        log.info("[UserService] getMyProfile 완료 - userId: {}", user.getUserId());
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void updateNickname(String email, String nickname) {
        log.info("[UserService] updateNickname 시작 - email: {}, nickname: {}", email, nickname);

        if (userRepository.existsByNickname(nickname)) {
            log.warn("[UserService] 이미 사용 중인 닉네임 - nickname: {}", nickname);
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        user.updateNickname(nickname);
        log.info("[UserService] updateNickname 완료 - userId: {}", user.getUserId());
    }

    @Transactional
    public void updatePassword(String email, String currentPassword, String newPassword) {
        log.info("[UserService] updatePassword 시작 - email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            log.warn("[UserService] 현재 비밀번호 불일치 - userId: {}", user.getUserId());
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        user.updatePassword(passwordEncoder.encode(newPassword));
        log.info("[UserService] updatePassword 완료 - userId: {}", user.getUserId());
    }

    @Transactional
    public void updateProfileImage(String email, MultipartFile file) {
        log.info("[UserService] updateProfileImage 시작 - email: {}", email);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어 있습니다.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }

        // 저장 디렉토리 생성
        Path uploadDir = Paths.get(uploadPath).toAbsolutePath();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            log.error("[UserService] 업로드 디렉토리 생성 실패", e);
            throw new RuntimeException("업로드 디렉토리 생성에 실패했습니다.");
        }

        // UUID 파일명으로 저장
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.'))
                : ".jpg";
        String filename = UUID.randomUUID() + ext;
        Path dest = uploadDir.resolve(filename);

        try {
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("[UserService] 파일 저장 실패 - path: {}", dest, e);
            throw new RuntimeException("파일 저장에 실패했습니다.");
        }

        String imageUrl = "/uploads/profiles/" + filename;
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        user.updateProfileImage(imageUrl);
        log.info("[UserService] updateProfileImage 완료 - userId: {}, url: {}", user.getUserId(), imageUrl);
    }

    @Transactional
    public void deleteAccount(String email, String password) {
        log.info("[UserService] deleteAccount 시작 - email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("[UserService] 비밀번호 불일치로 탈퇴 거절 - userId: {}", user.getUserId());
            throw new IllegalArgumentException("비밀번호가 올바르지 않습니다.");
        }

        Long userId = user.getUserId();

        // 유저가 작성한 여행 일기 ID 목록 조회
        List<Long> logIds = travelLogRepository.findLogIdsByUserId(userId);

        if (!logIds.isEmpty()) {
            // 여행 일기의 이미지, 댓글, 좋아요 삭제
            logImageRepository.deleteByTravelLogIdIn(logIds);
            commentRepository.deleteByTravelLogIdIn(logIds);
            likeRepository.deleteByTravelLogIdIn(logIds);
        }

        // 다른 일기에 남긴 댓글 및 좋아요 삭제
        commentRepository.deleteByUserId(userId);
        likeRepository.deleteByUserId(userId);

        // 여행 일기 삭제
        travelLogRepository.deleteByUserId(userId);

        // 유저 삭제
        userRepository.delete(user);
        log.info("[UserService] deleteAccount 완료 - userId: {}", userId);
    }
}
