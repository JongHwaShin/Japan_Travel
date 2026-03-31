package com.japantravel.service;

import com.japantravel.domain.Place;
import com.japantravel.domain.PlaceImage;
import com.japantravel.repository.PlaceImageRepository;
import com.japantravel.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceImageService {

    private final PlaceRepository placeRepository;
    private final PlaceImageRepository placeImageRepository;
    private final GooglePlacesService googlePlacesService;

    /**
     * 전체 장소의 이미지를 Google Places API로 수집하여 place_images 테이블에 저장
     * 이미 이미지가 있는 장소는 건너뜀
     */
    @Transactional
    public void fetchAndSaveAllPlaceImages() {
        List<Place> places = placeRepository.findAll();
        log.info("[PlaceImageService] fetchAndSaveAllPlaceImages 시작 - 전체 장소 수: {}", places.size());

        int saved = 0;
        int skipped = 0;
        int failed = 0;

        for (Place place : places) {
            if (placeImageRepository.existsByPlace_PlaceId(place.getPlaceId())) {
                log.info("[PlaceImageService] 이미지 존재, 건너뜀 - placeId: {}, name: {}",
                        place.getPlaceId(), place.getNameKo());
                skipped++;
                continue;
            }

            String address = place.getAddress() != null ? place.getAddress() : "";
            String photoUrl = googlePlacesService.searchPlacePhoto(place.getNameKo(), address);

            if (photoUrl != null) {
                PlaceImage image = PlaceImage.builder()
                        .place(place)
                        .imageUrl(photoUrl)
                        .isMain(true)
                        .build();
                placeImageRepository.save(image);
                log.info("[PlaceImageService] 이미지 저장 완료 - placeId: {}, name: {}",
                        place.getPlaceId(), place.getNameKo());
                saved++;
            } else {
                log.info("[PlaceImageService] 이미지 없음 - placeId: {}, name: {}",
                        place.getPlaceId(), place.getNameKo());
                failed++;
            }

            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("[PlaceImageService] 인터럽트 발생, 수집 중단");
                break;
            }
        }

        log.info("[PlaceImageService] fetchAndSaveAllPlaceImages 완료 - 저장: {}, 건너뜀: {}, 실패: {}",
                saved, skipped, failed);
    }
}
