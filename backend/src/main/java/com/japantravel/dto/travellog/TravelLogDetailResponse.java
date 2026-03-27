package com.japantravel.dto.travellog;

import com.japantravel.domain.TravelLog;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class TravelLogDetailResponse {

    private Long logId;
    private Long userId;
    private String nickname;
    private Long regionId;
    private String regionNameKo;
    private String title;
    private String content;
    private LocalDate travelDate;
    private Boolean isPublic;
    private Integer viewCount;
    private long likeCount;
    private boolean liked;           // 현재 로그인 유저의 좋아요 여부
    private List<LogImageResponse> images;
    private List<CommentResponse> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TravelLogDetailResponse from(TravelLog log, long likeCount, boolean liked) {
        return TravelLogDetailResponse.builder()
                .logId(log.getLogId())
                .userId(log.getUser().getUserId())
                .nickname(log.getUser().getNickname())
                .regionId(log.getRegion() != null ? log.getRegion().getRegionId() : null)
                .regionNameKo(log.getRegion() != null ? log.getRegion().getNameKo() : null)
                .title(log.getTitle())
                .content(log.getContent())
                .travelDate(log.getTravelDate())
                .isPublic(log.getIsPublic())
                .viewCount(log.getViewCount())
                .likeCount(likeCount)
                .liked(liked)
                .images(log.getImages().stream().map(LogImageResponse::from).toList())
                .comments(log.getComments().stream().map(CommentResponse::from).toList())
                .createdAt(log.getCreatedAt())
                .updatedAt(log.getUpdatedAt())
                .build();
    }
}
