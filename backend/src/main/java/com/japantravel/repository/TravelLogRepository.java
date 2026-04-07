package com.japantravel.repository;

import com.japantravel.domain.TravelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TravelLogRepository extends JpaRepository<TravelLog, Long> {

    List<TravelLog> findByIsPublicTrueOrderByCreatedAtDesc();

    @Query("SELECT t FROM TravelLog t WHERE t.user.userId = :userId ORDER BY t.createdAt DESC")
    List<TravelLog> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT t FROM TravelLog t WHERE t.region.regionId = :regionId AND t.isPublic = true")
    List<TravelLog> findByRegionIdAndIsPublicTrue(@Param("regionId") Long regionId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE TravelLog t SET t.viewCount = t.viewCount + 1 WHERE t.logId = :logId")
    void incrementViewCount(@Param("logId") Long logId);

    @Query("SELECT t.logId FROM TravelLog t WHERE t.user.userId = :userId")
    List<Long> findLogIdsByUserId(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM TravelLog t WHERE t.user.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
