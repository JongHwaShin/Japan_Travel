package com.japantravel.repository;

import com.japantravel.domain.LogImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LogImageRepository extends JpaRepository<LogImage, Long> {

    @Query("SELECT li FROM LogImage li WHERE li.travelLog.logId = :logId")
    List<LogImage> findByLogId(@Param("logId") Long logId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM LogImage li WHERE li.travelLog.logId IN :logIds")
    void deleteByTravelLogIdIn(@Param("logIds") List<Long> logIds);
}
