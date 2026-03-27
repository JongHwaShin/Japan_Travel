package com.japantravel.repository;

import com.japantravel.domain.PlaceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlaceImageRepository extends JpaRepository<PlaceImage, Long> {

    @Query("SELECT pi FROM PlaceImage pi WHERE pi.place.placeId = :placeId")
    List<PlaceImage> findByPlaceId(@Param("placeId") Long placeId);
}
