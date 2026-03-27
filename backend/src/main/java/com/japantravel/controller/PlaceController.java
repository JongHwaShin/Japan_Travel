package com.japantravel.controller;

import com.japantravel.domain.enums.PlaceCategory;
import com.japantravel.dto.common.ApiResponse;
import com.japantravel.dto.place.PlaceResponse;
import com.japantravel.service.PlaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    /**
     * 전체 장소 목록 조회
     * GET /api/places?regionId=1&category=맛집
     * regionId, category 모두 선택 파라미터
     */
    @GetMapping
    public ApiResponse<List<PlaceResponse>> getPlaces(
            @RequestParam(required = false) Long regionId,
            @RequestParam(required = false) PlaceCategory category) {
        log.info("[PlaceController] GET /api/places - regionId: {}, category: {}", regionId, category);
        List<PlaceResponse> result = placeService.getPlaces(regionId, category);
        return ApiResponse.ok("장소 목록 조회 성공", result);
    }

    /**
     * 장소 상세 조회
     * GET /api/places/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<PlaceResponse> getPlace(@PathVariable Long id) {
        log.info("[PlaceController] GET /api/places/{}", id);
        PlaceResponse result = placeService.getPlace(id);
        return ApiResponse.ok("장소 상세 조회 성공", result);
    }
}
