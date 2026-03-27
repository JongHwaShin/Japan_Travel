package com.japantravel.repository;

import com.japantravel.domain.Place;
import com.japantravel.domain.enums.PlaceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    @Query("SELECT p FROM Place p WHERE p.region.regionId = :regionId")
    List<Place> findByRegionId(@Param("regionId") Long regionId);

    List<Place> findByCategory(PlaceCategory category);

    @Query("SELECT p FROM Place p WHERE p.region.regionId = :regionId AND p.category = :category")
    List<Place> findByRegionIdAndCategory(@Param("regionId") Long regionId,
                                          @Param("category") PlaceCategory category);
}
