package com.japantravel.controller;

import com.japantravel.dto.common.ApiResponse;
import com.japantravel.dto.region.RegionResponse;
import com.japantravel.service.RegionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    /**
     * 전체 지역 목록 조회
     * GET /api/regions
     */
    @GetMapping
    public ApiResponse<List<RegionResponse>> getAllRegions() {
        log.info("[RegionController] GET /api/regions");
        List<RegionResponse> result = regionService.getAllRegions();
        return ApiResponse.ok("지역 목록 조회 성공", result);
    }

    /**
     * 지역 상세 조회
     * GET /api/regions/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<RegionResponse> getRegion(@PathVariable Long id) {
        log.info("[RegionController] GET /api/regions/{}", id);
        RegionResponse result = regionService.getRegionById(id);
        return ApiResponse.ok("지역 상세 조회 성공", result);
    }
}
