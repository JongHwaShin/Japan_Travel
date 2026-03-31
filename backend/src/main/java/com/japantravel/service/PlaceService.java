package com.japantravel.service;

import com.japantravel.domain.Place;
import com.japantravel.domain.enums.PlaceCategory;
import com.japantravel.dto.place.PlaceImageResponse;
import com.japantravel.dto.place.PlacePageResponse;
import com.japantravel.dto.place.PlaceResponse;
import com.japantravel.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceRepository placeRepository;

    /**
     * 전체 장소 목록 조회 (지역/카테고리 필터 + 페이지네이션)
     */
    @Transactional(readOnly = true)
    public PlacePageResponse getPlaces(Long regionId, PlaceCategory category, int page, int size) {
        log.info("[PlaceService] getPlaces 시작 - regionId: {}, category: {}, page: {}, size: {}",
                regionId, category, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<Place> pageResult;

        if (regionId != null && category != null) {
            pageResult = placeRepository.findByRegionIdAndCategory(regionId, category, pageable);
        } else if (regionId != null) {
            pageResult = placeRepository.findByRegionId(regionId, pageable);
        } else if (category != null) {
            pageResult = placeRepository.findByCategory(category, pageable);
        } else {
            pageResult = placeRepository.findAll(pageable);
        }

        List<PlaceResponse> content = pageResult.getContent().stream()
                .map(this::toResponseWithFallbackImage)
                .toList();

        log.info("[PlaceService] getPlaces 완료 - 조회 건수: {}, 전체: {}",
                content.size(), pageResult.getTotalElements());

        return PlacePageResponse.builder()
                .content(content)
                .totalPages(pageResult.getTotalPages())
                .totalElements(pageResult.getTotalElements())
                .currentPage(page)
                .hasNext(pageResult.hasNext())
                .hasPrevious(pageResult.hasPrevious())
                .build();
    }

    /**
     * 장소 상세 조회 (이미지 포함)
     */
    @Transactional(readOnly = true)
    public PlaceResponse getPlace(Long placeId) {
        log.info("[PlaceService] getPlace 시작 - placeId: {}", placeId);

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> {
                    log.warn("[PlaceService] 존재하지 않는 장소 - placeId: {}", placeId);
                    return new IllegalArgumentException("존재하지 않는 장소입니다.");
                });

        PlaceResponse response = toResponseWithFallbackImage(place);
        log.info("[PlaceService] getPlace 완료 - placeId: {}, 이미지 수: {}",
                placeId, response.getImages().size());
        return response;
    }

    /**
     * Place → PlaceResponse 변환
     * 이미지는 place_images 테이블에서 가져오며, 없으면 빈 리스트 반환
     */
    private PlaceResponse toResponseWithFallbackImage(Place place) {
        List<PlaceImageResponse> images = place.getImages().stream()
                .map(PlaceImageResponse::from)
                .toList();

        return PlaceResponse.builder()
                .placeId(place.getPlaceId())
                .regionId(place.getRegion().getRegionId())
                .regionNameKo(place.getRegion().getNameKo())
                .category(place.getCategory())
                .nameKo(place.getNameKo())
                .nameJp(place.getNameJp())
                .address(place.getAddress())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .description(place.getDescription())
                .openHours(place.getOpenHours())
                .rating(place.getRating())
                .createdAt(place.getCreatedAt())
                .images(images)
                .build();
    }
}
