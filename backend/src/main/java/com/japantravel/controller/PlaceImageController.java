package com.japantravel.controller;

import com.japantravel.dto.common.ApiResponse;
import com.japantravel.service.PlaceImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class PlaceImageController {

    private final PlaceImageService placeImageService;

    /**
     * Google Places API로 이미지 수집 후 place_images 테이블에 저장
     * 이미지 없는 장소만 처리 (중복 실행 안전)
     * POST /api/admin/fetch-images
     */
    @PostMapping("/fetch-images")
    public ApiResponse<Void> fetchImages() {
        log.info("[PlaceImageController] POST /api/admin/fetch-images");
        placeImageService.fetchAndSaveAllPlaceImages();
        return ApiResponse.ok("이미지 수집 완료", null);
    }
}
