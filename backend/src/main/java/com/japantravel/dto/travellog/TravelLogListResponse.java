package com.japantravel.dto.travellog;

import com.japantravel.domain.TravelLog;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class TravelLogListResponse {

    private Long logId;
    private Long userId;
    private String nickname;
    private Long regionId;
    private String regionNameKo;
    private String title;
    private LocalDate travelDate;
    private Boolean isPublic;
    private Integer viewCount;
    private LocalDateTime createdAt;

    public static TravelLogListResponse from(TravelLog log) {
        return TravelLogListResponse.builder()
                .logId(log.getLogId())
                .userId(log.getUser().getUserId())
                .nickname(log.getUser().getNickname())
                .regionId(log.getRegion() != null ? log.getRegion().getRegionId() : null)
                .regionNameKo(log.getRegion() != null ? log.getRegion().getNameKo() : null)
                .title(log.getTitle())
                .travelDate(log.getTravelDate())
                .isPublic(log.getIsPublic())
                .viewCount(log.getViewCount())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
