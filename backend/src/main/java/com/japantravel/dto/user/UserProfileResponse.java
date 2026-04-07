package com.japantravel.dto.user;

import com.japantravel.domain.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserProfileResponse {

    private final Long userId;
    private final String email;
    private final String nickname;
    private final String profileImage;
    private final LocalDateTime createdAt;

    private UserProfileResponse(User user) {
        this.userId       = user.getUserId();
        this.email        = user.getEmail();
        this.nickname     = user.getNickname();
        this.profileImage = user.getProfileImage();
        this.createdAt    = user.getCreatedAt();
    }

    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(user);
    }
}
