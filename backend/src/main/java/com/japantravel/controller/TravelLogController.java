package com.japantravel.controller;

import com.japantravel.dto.common.ApiResponse;
import com.japantravel.dto.travellog.*;
import com.japantravel.security.UserPrincipal;
import com.japantravel.service.TravelLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class TravelLogController {

    private final TravelLogService travelLogService;

    /**
     * 공개 일기 목록 (최신순)
     * GET /api/logs
     */
    @GetMapping
    public ApiResponse<List<TravelLogListResponse>> getPublicLogs() {
        log.info("[TravelLogController] GET /api/logs");
        List<TravelLogListResponse> result = travelLogService.getPublicLogs();
        return ApiResponse.ok("공개 일기 목록 조회 성공", result);
    }

    /**
     * 내 일기 목록 (로그인 필요)
     * GET /api/logs/my
     */
    @GetMapping("/my")
    public ApiResponse<List<TravelLogListResponse>> getMyLogs(
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("[TravelLogController] GET /api/logs/my - userId: {}", principal.getUserId());
        List<TravelLogListResponse> result = travelLogService.getMyLogs(principal.getUserId());
        return ApiResponse.ok("내 일기 목록 조회 성공", result);
    }

    /**
     * 일기 상세 조회 (조회수 자동 증가, 비로그인 허용)
     * GET /api/logs/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<TravelLogDetailResponse> getLogDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long currentUserId = (principal != null) ? principal.getUserId() : null;
        log.info("[TravelLogController] GET /api/logs/{} - currentUserId: {}", id, currentUserId);
        TravelLogDetailResponse result = travelLogService.getLogDetail(id, currentUserId);
        return ApiResponse.ok("일기 상세 조회 성공", result);
    }

    /**
     * 일기 작성 (로그인 필요)
     * POST /api/logs
     */
    @PostMapping
    public ApiResponse<TravelLogDetailResponse> createLog(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TravelLogCreateRequest request) {
        log.info("[TravelLogController] POST /api/logs - userId: {}", principal.getUserId());
        TravelLogDetailResponse result = travelLogService.createLog(principal.getUserId(), request);
        return ApiResponse.ok("일기 작성 성공", result);
    }

    /**
     * 일기 수정 (본인만)
     * PUT /api/logs/{id}
     */
    @PutMapping("/{id}")
    public ApiResponse<TravelLogDetailResponse> updateLog(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TravelLogUpdateRequest request) {
        log.info("[TravelLogController] PUT /api/logs/{} - userId: {}", id, principal.getUserId());
        TravelLogDetailResponse result = travelLogService.updateLog(id, principal.getUserId(), request);
        return ApiResponse.ok("일기 수정 성공", result);
    }

    /**
     * 일기 삭제 (본인만)
     * DELETE /api/logs/{id}
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteLog(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("[TravelLogController] DELETE /api/logs/{} - userId: {}", id, principal.getUserId());
        travelLogService.deleteLog(id, principal.getUserId());
        return ApiResponse.ok("일기 삭제 성공");
    }

    /**
     * 좋아요 토글 (로그인 필요)
     * POST /api/logs/{id}/like
     */
    @PostMapping("/{id}/like")
    public ApiResponse<Void> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        log.info("[TravelLogController] POST /api/logs/{}/like - userId: {}", id, principal.getUserId());
        boolean liked = travelLogService.toggleLike(id, principal.getUserId());
        String message = liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.";
        return ApiResponse.ok(message);
    }

    /**
     * 댓글 작성 (로그인 필요)
     * POST /api/logs/{id}/comments
     */
    @PostMapping("/{id}/comments")
    public ApiResponse<CommentResponse> addComment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CommentRequest request) {
        log.info("[TravelLogController] POST /api/logs/{}/comments - userId: {}", id, principal.getUserId());
        CommentResponse result = travelLogService.addComment(id, principal.getUserId(), request.getContent());
        return ApiResponse.ok("댓글 작성 성공", result);
    }
}
