package com.japantravel.dto.travellog;

import com.japantravel.domain.LogImage;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LogImageResponse {

    private Long imageId;
    private String imageUrl;

    public static LogImageResponse from(LogImage image) {
        return LogImageResponse.builder()
                .imageId(image.getImageId())
                .imageUrl(image.getImageUrl())
                .build();
    }
}
