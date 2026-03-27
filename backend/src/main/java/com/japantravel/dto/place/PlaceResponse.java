package com.japantravel.dto.place;

import com.japantravel.domain.Place;
import com.japantravel.domain.enums.PlaceCategory;
import com.japantravel.domain.enums.PriceRange;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PlaceResponse {

    private Long placeId;
    private Long regionId;
    private String regionNameKo;
    private PlaceCategory category;
    private String nameKo;
    private String nameJp;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String description;
    private String openHours;
    private PriceRange priceRange;
    private BigDecimal rating;
    private LocalDateTime createdAt;
    private List<PlaceImageResponse> images;

    public static PlaceResponse from(Place place) {
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
                .images(place.getImages().stream()
                        .map(PlaceImageResponse::from)
                        .toList())
                .build();
    }
}
