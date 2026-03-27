package com.japantravel.dto.region;

import com.japantravel.domain.Region;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RegionResponse {

    private final Long regionId;
    private final String nameKo;
    private final String nameJp;
    private final String description;

    public static RegionResponse from(Region region) {
        return RegionResponse.builder()
                .regionId(region.getRegionId())
                .nameKo(region.getNameKo())
                .nameJp(region.getNameJp())
                .description(region.getDescription())
                .build();
    }
}
