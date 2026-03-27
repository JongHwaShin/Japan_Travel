package com.japantravel.service;

import com.japantravel.domain.enums.PlaceCategory;
import com.japantravel.dto.place.PlaceResponse;
import com.japantravel.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;

    /**
     * 전체 장소 목록 조회 (지역/카테고리 필터 옵션)
     * regionId와 category 모두 null이면 전체 조회
     */
    @Transactional(readOnly = true)
    public List<PlaceResponse> getPlaces(Long regionId, PlaceCategory category) {
        log.info("[PlaceService] getPlaces 시작 - regionId: {}, category: {}", regionId, category);

        List<PlaceResponse> result;

        if (regionId != null && category != null) {
            result = placeRepository.findByRegionIdAndCategory(regionId, category)
                    .stream().map(PlaceResponse::from).toList();
        } else if (regionId != null) {
            result = placeRepository.findByRegionId(regionId)
                    .stream().map(PlaceResponse::from).toList();
        } else if (category != null) {
            result = placeRepository.findByCategory(category)
                    .stream().map(PlaceResponse::from).toList();
        } else {
            result = placeRepository.findAll()
                    .stream().map(PlaceResponse::from).toList();
        }

        log.info("[PlaceService] getPlaces 완료 - 조회 건수: {}", result.size());
        return result;
    }

    /**
     * 장소 상세 조회 (이미지 포함)
     */
    @Transactional(readOnly = true)
    public PlaceResponse getPlace(Long placeId) {
        log.info("[PlaceService] getPlace 시작 - placeId: {}", placeId);

        PlaceResponse response = placeRepository.findById(placeId)
                .map(PlaceResponse::from)
                .orElseThrow(() -> {
                    log.warn("[PlaceService] 존재하지 않는 장소 - placeId: {}", placeId);
                    return new IllegalArgumentException("존재하지 않는 장소입니다.");
                });

        log.info("[PlaceService] getPlace 완료 - placeId: {}, 이미지 수: {}", placeId, response.getImages().size());
        return response;
    }
}
