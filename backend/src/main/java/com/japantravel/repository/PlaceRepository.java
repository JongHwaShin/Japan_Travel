package com.japantravel.repository;

import com.japantravel.domain.Place;
import com.japantravel.domain.enums.PlaceCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    @Query("SELECT p FROM Place p WHERE p.region.regionId = :regionId")
    Page<Place> findByRegionId(@Param("regionId") Long regionId, Pageable pageable);

    Page<Place> findByCategory(PlaceCategory category, Pageable pageable);

    @Query("SELECT p FROM Place p WHERE p.region.regionId = :regionId AND p.category = :category")
    Page<Place> findByRegionIdAndCategory(@Param("regionId") Long regionId,
                                          @Param("category") PlaceCategory category,
                                          Pageable pageable);
}
