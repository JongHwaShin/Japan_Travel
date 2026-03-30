package com.japantravel.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GooglePlacesService {

    private static final String TEXTSEARCH_URL =
            "https://maps.googleapis.com/maps/api/place/textsearch/json";
    private static final String PHOTO_URL =
            "https://maps.googleapis.com/maps/api/place/photo";

    @Value("${google.places.api-key}")
    private String apiKey;

    private final WebClient webClient;

    public GooglePlacesService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * 장소명 + 지역명으로 Google Places Text Search API 검색 후 사진 URL 반환
     *
     * @return 사진 URL, 결과 없거나 실패하면 null
     */
    @SuppressWarnings("unchecked")
    public String searchPlacePhoto(String placeName, String regionName) {
        String query = placeName + " " + regionName;
        log.info("[GooglePlacesService] 사진 검색 시작 - query: {}", query);

        try {
            Map<String, Object> response = webClient.get()
                    .uri(UriComponentsBuilder.fromHttpUrl(TEXTSEARCH_URL)
                            .queryParam("query", query)
                            .queryParam("key", apiKey)
                            .build()
                            .toUri())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                log.warn("[GooglePlacesService] 응답 없음 - query: {}", query);
                return null;
            }

            List<Map<String, Object>> results =
                    (List<Map<String, Object>>) response.get("results");
            if (results == null || results.isEmpty()) {
                log.info("[GooglePlacesService] 검색 결과 없음 - query: {}", query);
                return null;
            }

            List<Map<String, Object>> photos =
                    (List<Map<String, Object>>) results.get(0).get("photos");
            if (photos == null || photos.isEmpty()) {
                log.info("[GooglePlacesService] 사진 레퍼런스 없음 - query: {}", query);
                return null;
            }

            String photoReference = (String) photos.get(0).get("photo_reference");
            String photoUrl = UriComponentsBuilder.fromHttpUrl(PHOTO_URL)
                    .queryParam("maxwidth", 800)
                    .queryParam("photo_reference", photoReference)
                    .queryParam("key", apiKey)
                    .build()
                    .toUriString();

            log.info("[GooglePlacesService] 사진 URL 생성 완료 - query: {}", query);
            return photoUrl;

        } catch (Exception e) {
            log.warn("[GooglePlacesService] 사진 검색 실패 - query: {}, error: {}",
                    query, e.getMessage());
            return null;
        }
    }
}
