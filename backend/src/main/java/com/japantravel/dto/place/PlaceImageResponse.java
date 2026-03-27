package com.japantravel.dto.place;

import com.japantravel.domain.PlaceImage;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlaceImageResponse {

    private Long imageId;
    private String imageUrl;
    private Boolean isMain;

    public static PlaceImageResponse from(PlaceImage image) {
        return PlaceImageResponse.builder()
                .imageId(image.getImageId())
                .imageUrl(image.getImageUrl())
                .isMain(image.getIsMain())
                .build();
    }
}
