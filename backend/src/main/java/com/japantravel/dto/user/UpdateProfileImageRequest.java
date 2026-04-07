package com.japantravel.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class UpdateProfileImageRequest {

    @NotBlank(message = "프로필 이미지 URL을 입력해주세요.")
    private String profileImageUrl;
}
