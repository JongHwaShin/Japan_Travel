package com.japantravel.service;

import com.japantravel.domain.Like;
import com.japantravel.domain.TravelLog;
import com.japantravel.domain.User;
import com.japantravel.repository.LikeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;

    @Transactional
    public void addLike(TravelLog travelLog, User user) {
        log.info("[LikeService] addLike 시작 - logId: {}, userId: {}", travelLog.getLogId(), user.getUserId());

        if (likeRepository.existsByTravelLog_LogIdAndUser_UserId(travelLog.getLogId(), user.getUserId())) {
            log.warn("[LikeService] 이미 좋아요를 누른 게시물 - logId: {}, userId: {}", travelLog.getLogId(), user.getUserId());
            throw new IllegalArgumentException("이미 좋아요를 누른 게시물입니다.");
        }

        Like like = Like.builder()
                .travelLog(travelLog)
                .user(user)
                .build();

        likeRepository.save(like);
        log.info("[LikeService] addLike 완료 - logId: {}, userId: {}", travelLog.getLogId(), user.getUserId());
    }

    @Transactional
    public void removeLike(Long logId, Long userId) {
        log.info("[LikeService] removeLike 시작 - logId: {}, userId: {}", logId, userId);

        if (!likeRepository.existsByTravelLog_LogIdAndUser_UserId(logId, userId)) {
            log.warn("[LikeService] 좋아요 기록 없음 - logId: {}, userId: {}", logId, userId);
            throw new IllegalArgumentException("좋아요 기록이 없습니다.");
        }

        likeRepository.deleteByTravelLog_LogIdAndUser_UserId(logId, userId);
        log.info("[LikeService] removeLike 완료 - logId: {}, userId: {}", logId, userId);
    }

    @Transactional(readOnly = true)
    public long getLikeCount(Long logId) {
        log.info("[LikeService] getLikeCount 시작 - logId: {}", logId);

        long count = likeRepository.countByTravelLog_LogId(logId);
        log.info("[LikeService] getLikeCount 완료 - logId: {}, count: {}", logId, count);
        return count;
    }

    @Transactional(readOnly = true)
    public boolean isLiked(Long logId, Long userId) {
        log.info("[LikeService] isLiked 시작 - logId: {}, userId: {}", logId, userId);

        boolean liked = likeRepository.existsByTravelLog_LogIdAndUser_UserId(logId, userId);
        log.info("[LikeService] isLiked 완료 - logId: {}, userId: {}, liked: {}", logId, userId, liked);
        return liked;
    }
}
