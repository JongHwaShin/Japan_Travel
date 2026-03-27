package com.japantravel.repository;

import com.japantravel.domain.TransportInfo;
import com.japantravel.domain.enums.TransportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransportInfoRepository extends JpaRepository<TransportInfo, Long> {

    @Query("SELECT t FROM TransportInfo t WHERE t.region.regionId = :regionId")
    List<TransportInfo> findByRegionId(@Param("regionId") Long regionId);

    List<TransportInfo> findByType(TransportType type);
}
