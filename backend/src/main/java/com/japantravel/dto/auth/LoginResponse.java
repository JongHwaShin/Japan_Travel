package com.japantravel.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private final Long userId;
    private final String email;
    private final String nickname;
    private final String accessToken;
    private final String refreshToken;

    public static LoginResponse of(Long userId, String email, String nickname,
                                   String accessToken, String refreshToken) {
        return LoginResponse.builder()
                .userId(userId)
                .email(email)
                .nickname(nickname)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
