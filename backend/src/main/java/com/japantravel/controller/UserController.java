package com.japantravel.controller;

import com.japantravel.dto.common.ApiResponse;
import com.japantravel.dto.user.DeleteAccountRequest;
import com.japantravel.dto.user.UpdateNicknameRequest;
import com.japantravel.dto.user.UpdatePasswordRequest;
import com.japantravel.dto.user.UserProfileResponse;
import com.japantravel.security.UserPrincipal;
import com.japantravel.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            log.warn("[UserController] GET /api/users/me - principal is null (unauthenticated request)");
            throw new IllegalArgumentException("인증 정보가 없습니다.");
        }
        log.info("[UserController] GET /api/users/me - email: {}", principal.getEmail());
        UserProfileResponse response = userService.getMyProfile(principal.getEmail());
        return ApiResponse.ok("프로필 조회 성공", response);
    }

    @PutMapping("/me/nickname")
    public ApiResponse<Void> updateNickname(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateNicknameRequest request) {
        log.info("[UserController] PUT /api/users/me/nickname - email: {}", principal.getEmail());
        userService.updateNickname(principal.getEmail(), request.getNickname());
        return ApiResponse.ok("닉네임이 변경되었습니다.");
    }

    @PutMapping("/me/password")
    public ApiResponse<Void> updatePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdatePasswordRequest request) {
        log.info("[UserController] PUT /api/users/me/password - email: {}", principal.getEmail());
        userService.updatePassword(principal.getEmail(), request.getCurrentPassword(), request.getNewPassword());
        return ApiResponse.ok("비밀번호가 변경되었습니다.");
    }

    @PutMapping(value = "/me/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<Void> updateProfileImage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        log.info("[UserController] PUT /api/users/me/profile-image - email: {}, filename: {}",
                principal.getEmail(), file.getOriginalFilename());
        userService.updateProfileImage(principal.getEmail(), file);
        return ApiResponse.ok("프로필 이미지가 변경되었습니다.");
    }

    @DeleteMapping("/me")
    public ApiResponse<Void> deleteAccount(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DeleteAccountRequest request) {
        log.info("[UserController] DELETE /api/users/me - email: {}", principal.getEmail());
        userService.deleteAccount(principal.getEmail(), request.getPassword());
        return ApiResponse.ok("회원 탈퇴가 완료되었습니다.");
    }
}
