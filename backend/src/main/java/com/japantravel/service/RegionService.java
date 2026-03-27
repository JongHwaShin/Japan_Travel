package com.japantravel.service;

import com.japantravel.dto.region.RegionResponse;
import com.japantravel.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegionService {

    private final RegionRepository regionRepository;

    @Transactional(readOnly = true)
    public List<RegionResponse> getAllRegions() {
        log.info("[RegionService] getAllRegions 시작");

        List<RegionResponse> result = regionRepository.findAll()
                .stream().map(RegionResponse::from).toList();

        log.info("[RegionService] getAllRegions 완료 - 조회 건수: {}", result.size());
        return result;
    }

    @Transactional(readOnly = true)
    public RegionResponse getRegionById(Long regionId) {
        log.info("[RegionService] getRegionById 시작 - regionId: {}", regionId);

        RegionResponse response = regionRepository.findById(regionId)
                .map(RegionResponse::from)
                .orElseThrow(() -> {
                    log.warn("[RegionService] 존재하지 않는 지역 - regionId: {}", regionId);
                    return new IllegalArgumentException("존재하지 않는 지역입니다.");
                });

        log.info("[RegionService] getRegionById 완료 - regionId: {}", regionId);
        return response;
    }
}
