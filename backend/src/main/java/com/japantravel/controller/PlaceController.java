package com.japantravel.controller;

import com.japantravel.domain.enums.PlaceCategory;
import com.japantravel.dto.common.ApiResponse;
import com.japantravel.dto.place.PlacePageResponse;
import com.japantravel.dto.place.PlaceResponse;
import com.japantravel.service.PlaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    /**
     * 장소 목록 조회 (페이지네이션)
     * GET /api/places?regionId=1&category=맛집&page=0&size=12
     */
    @GetMapping
    public ApiResponse<PlacePageResponse> getPlaces(
            @RequestParam(required = false) Long regionId,
            @RequestParam(required = false) PlaceCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        log.info("[PlaceController] GET /api/places - regionId: {}, category: {}, page: {}, size: {}",
                regionId, category, page, size);
        PlacePageResponse result = placeService.getPlaces(regionId, category, page, size);
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
