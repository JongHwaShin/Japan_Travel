package com.japantravel.repository;

import com.japantravel.domain.Like;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByTravelLog_LogIdAndUser_UserId(Long logId, Long userId);
    void deleteByTravelLog_LogIdAndUser_UserId(Long logId, Long userId);
    long countByTravelLog_LogId(Long logId);
}
