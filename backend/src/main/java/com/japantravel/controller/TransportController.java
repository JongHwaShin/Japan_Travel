package com.japantravel.controller;

import com.japantravel.dto.common.ApiResponse;
import com.japantravel.dto.transport.TransportResponse;
import com.japantravel.service.TransportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/transport")
@RequiredArgsConstructor
public class TransportController {

    private final TransportService transportService;

    /**
     * 전체 교통정보 조회
     * GET /api/transport
     */
    @GetMapping
    public ApiResponse<List<TransportResponse>> getAllTransports() {
        log.info("[TransportController] GET /api/transport");
        List<TransportResponse> result = transportService.getAllTransports();
        return ApiResponse.ok("교통정보 조회 성공", result);
    }

    /**
     * 지역별 교통정보 조회
     * GET /api/transport/{regionId}
     */
    @GetMapping("/{regionId}")
    public ApiResponse<List<TransportResponse>> getTransportsByRegion(@PathVariable Long regionId) {
        log.info("[TransportController] GET /api/transport/{}", regionId);
        List<TransportResponse> result = transportService.getTransportsByRegion(regionId);
        return ApiResponse.ok("지역별 교통정보 조회 성공", result);
    }
}
