package com.japantravel.service;

import com.japantravel.domain.Place;
import com.japantravel.domain.enums.PlaceCategory;
import com.japantravel.dto.place.PlaceImageResponse;
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
    private final GooglePlacesService googlePlacesService;

    /**
     * 전체 장소 목록 조회 (지역/카테고리 필터 옵션)
     * regionId와 category 모두 null이면 전체 조회
     */
    @Transactional(readOnly = true)
    public List<PlaceResponse> getPlaces(Long regionId, PlaceCategory category) {
        log.info("[PlaceService] getPlaces 시작 - regionId: {}, category: {}", regionId, category);

        List<Place> places;

        if (regionId != null && category != null) {
            places = placeRepository.findByRegionIdAndCategory(regionId, category);
        } else if (regionId != null) {
            places = placeRepository.findByRegionId(regionId);
        } else if (category != null) {
            places = placeRepository.findByCategory(category);
        } else {
            places = placeRepository.findAll();
        }

        List<PlaceResponse> result = places.stream()
                .map(this::toResponseWithFallbackImage)
                .toList();

        log.info("[PlaceService] getPlaces 완료 - 조회 건수: {}", result.size());
        return result;
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
     * place_images 없으면 Google Places API로 사진 자동 검색
     */
    private PlaceResponse toResponseWithFallbackImage(Place place) {
        List<PlaceImageResponse> images = place.getImages().stream()
                .map(PlaceImageResponse::from)
                .toList();

        if (images.isEmpty()) {
            String photoUrl = googlePlacesService.searchPlacePhoto(
                    place.getNameKo(), place.getRegion().getNameKo());
            if (photoUrl != null) {
                images = List.of(PlaceImageResponse.builder()
                        .imageId(null)
                        .imageUrl(photoUrl)
                        .isMain(true)
                        .build());
            }
        }

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
                .priceRange(place.getPriceRange())
                .rating(place.getRating())
                .createdAt(place.getCreatedAt())
                .images(images)
                .build();
    }
}
