package com.japantravel.dto.travellog;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class TravelLogUpdateRequest {

    @Size(max = 200, message = "제목은 200자 이하여야 합니다.")
    private String title;

    private String content;

    private Long regionId;

    private LocalDate travelDate;

    private Boolean isPublic;
}
