package com.japantravel.service;

import com.japantravel.domain.*;
import com.japantravel.dto.travellog.*;
import com.japantravel.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TravelLogService {

    private final TravelLogRepository travelLogRepository;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    // ──────────────────────────────────────────────
    // 1. 공개 일기 목록 조회 (최신순)
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<TravelLogListResponse> getPublicLogs() {
        log.info("[TravelLogService] getPublicLogs 시작");

        List<TravelLogListResponse> result = travelLogRepository
                .findByIsPublicTrueOrderByCreatedAtDesc()
                .stream().map(TravelLogListResponse::from).toList();

        log.info("[TravelLogService] getPublicLogs 완료 - 조회 건수: {}", result.size());
        return result;
    }

    // ──────────────────────────────────────────────
    // 2. 내 일기 목록 조회
    // ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<TravelLogListResponse> getMyLogs(Long userId) {
        log.info("[TravelLogService] getMyLogs 시작 - userId: {}", userId);

        List<TravelLogListResponse> result = travelLogRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(TravelLogListResponse::from).toList();

        log.info("[TravelLogService] getMyLogs 완료 - userId: {}, 조회 건수: {}", userId, result.size());
        return result;
    }

    // ──────────────────────────────────────────────
    // 3. 일기 상세 조회 (이미지, 댓글, 좋아요 수 + 조회수 증가)
    // ──────────────────────────────────────────────
    @Transactional
    public TravelLogDetailResponse getLogDetail(Long logId, Long currentUserId) {
        log.info("[TravelLogService] getLogDetail 시작 - logId: {}, currentUserId: {}", logId, currentUserId);

        travelLogRepository.incrementViewCount(logId);
        log.info("[TravelLogService] 조회수 증가 - logId: {}", logId);

        TravelLog log_ = findLogOrThrow(logId);  // increment 후 최신 viewCount 반영

        long likeCount = likeRepository.countByTravelLog_LogId(logId);
        boolean liked = currentUserId != null &&
                likeRepository.existsByTravelLog_LogIdAndUser_UserId(logId, currentUserId);

        TravelLogDetailResponse response = TravelLogDetailResponse.from(log_, likeCount, liked);
        log.info("[TravelLogService] getLogDetail 완료 - logId: {}, likeCount: {}, commentCount: {}",
                logId, likeCount, response.getComments().size());
        return response;
    }

    // ──────────────────────────────────────────────
    // 4. 일기 작성
    // ──────────────────────────────────────────────
    @Transactional
    public TravelLogDetailResponse createLog(Long userId, TravelLogCreateRequest request) {
        log.info("[TravelLogService] createLog 시작 - userId: {}, title: {}", userId, request.getTitle());

        User user = findUserOrThrow(userId);

        Region region = null;
        if (request.getRegionId() != null) {
            region = regionRepository.findById(request.getRegionId())
                    .orElseThrow(() -> {
                        log.warn("[TravelLogService] 존재하지 않는 지역 - regionId: {}", request.getRegionId());
                        return new IllegalArgumentException("존재하지 않는 지역입니다.");
                    });
        }

        TravelLog travelLog = TravelLog.builder()
                .user(user)
                .region(region)
                .title(request.getTitle())
                .content(request.getContent())
                .travelDate(request.getTravelDate())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .build();

        TravelLog saved = travelLogRepository.save(travelLog);
        log.info("[TravelLogService] createLog 완료 - logId: {}", saved.getLogId());
        return TravelLogDetailResponse.from(saved, 0L, false);
    }

    // ──────────────────────────────────────────────
    // 5. 일기 수정 (본인만)
    // ──────────────────────────────────────────────
    @Transactional
    public TravelLogDetailResponse updateLog(Long logId, Long userId, TravelLogUpdateRequest request) {
        log.info("[TravelLogService] updateLog 시작 - logId: {}, userId: {}", logId, userId);

        TravelLog travelLog = findLogOrThrow(logId);
        checkOwner(travelLog, userId, "수정");

        Region region = null;
        if (request.getRegionId() != null) {
            region = regionRepository.findById(request.getRegionId())
                    .orElseThrow(() -> {
                        log.warn("[TravelLogService] 존재하지 않는 지역 - regionId: {}", request.getRegionId());
                        return new IllegalArgumentException("존재하지 않는 지역입니다.");
                    });
        }
        travelLog.update(request.getTitle(), request.getContent(),
                request.getIsPublic(), request.getTravelDate(), region);

        log.info("[TravelLogService] updateLog 완료 - logId: {}", logId);

        long likeCount = likeRepository.countByTravelLog_LogId(logId);
        boolean liked = likeRepository.existsByTravelLog_LogIdAndUser_UserId(logId, userId);
        return TravelLogDetailResponse.from(travelLog, likeCount, liked);
    }

    // ──────────────────────────────────────────────
    // 6. 일기 삭제 (본인만)
    // ──────────────────────────────────────────────
    @Transactional
    public void deleteLog(Long logId, Long userId) {
        log.info("[TravelLogService] deleteLog 시작 - logId: {}, userId: {}", logId, userId);

        TravelLog travelLog = findLogOrThrow(logId);
        checkOwner(travelLog, userId, "삭제");

        travelLogRepository.delete(travelLog);
        log.info("[TravelLogService] deleteLog 완료 - logId: {}", logId);
    }

    // ──────────────────────────────────────────────
    // 7. 좋아요 토글 (추가 / 취소)
    // ──────────────────────────────────────────────
    @Transactional
    public boolean toggleLike(Long logId, Long userId) {
        log.info("[TravelLogService] toggleLike 시작 - logId: {}, userId: {}", logId, userId);

        TravelLog travelLog = findLogOrThrow(logId);
        User user = findUserOrThrow(userId);

        boolean alreadyLiked = likeRepository.existsByTravelLog_LogIdAndUser_UserId(logId, userId);

        if (alreadyLiked) {
            likeRepository.deleteByTravelLog_LogIdAndUser_UserId(logId, userId);
            log.info("[TravelLogService] 좋아요 취소 - logId: {}, userId: {}", logId, userId);
            return false;
        } else {
            Like like = Like.builder().travelLog(travelLog).user(user).build();
            likeRepository.save(like);
            log.info("[TravelLogService] 좋아요 추가 - logId: {}, userId: {}", logId, userId);
            return true;
        }
    }

    // ──────────────────────────────────────────────
    // 8. 댓글 작성
    // ──────────────────────────────────────────────
    @Transactional
    public CommentResponse addComment(Long logId, Long userId, String content) {
        log.info("[TravelLogService] addComment 시작 - logId: {}, userId: {}", logId, userId);

        TravelLog travelLog = findLogOrThrow(logId);
        User user = findUserOrThrow(userId);

        Comment comment = Comment.builder()
                .travelLog(travelLog)
                .user(user)
                .content(content)
                .build();

        Comment saved = commentRepository.save(comment);
        log.info("[TravelLogService] addComment 완료 - commentId: {}", saved.getCommentId());
        return CommentResponse.from(saved);
    }

    // ──────────────────────────────────────────────
    // private 헬퍼
    // ──────────────────────────────────────────────
    private TravelLog findLogOrThrow(Long logId) {
        return travelLogRepository.findById(logId)
                .orElseThrow(() -> {
                    log.warn("[TravelLogService] 존재하지 않는 일기 - logId: {}", logId);
                    return new IllegalArgumentException("존재하지 않는 여행 일기입니다.");
                });
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("[TravelLogService] 존재하지 않는 사용자 - userId: {}", userId);
                    return new IllegalArgumentException("존재하지 않는 사용자입니다.");
                });
    }

    private void checkOwner(TravelLog travelLog, Long userId, String action) {
        if (!travelLog.getUser().getUserId().equals(userId)) {
            log.warn("[TravelLogService] {} 권한 없음 - logId: {}, requestUserId: {}",
                    action, travelLog.getLogId(), userId);
            throw new IllegalArgumentException("본인의 일기만 " + action + "할 수 있습니다.");
        }
    }
}
