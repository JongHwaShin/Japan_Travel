package com.japantravel.repository;

import com.japantravel.domain.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByTravelLog_LogIdAndUser_UserId(Long logId, Long userId);
    void deleteByTravelLog_LogIdAndUser_UserId(Long logId, Long userId);
    long countByTravelLog_LogId(Long logId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Like l WHERE l.user.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM Like l WHERE l.travelLog.logId IN :logIds")
    void deleteByTravelLogIdIn(@Param("logIds") List<Long> logIds);
}
