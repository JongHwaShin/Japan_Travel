package com.japantravel.dto.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {

    private final String accessToken;
    private final String refreshToken;
    private final String nickname;

    public static LoginResponse of(String accessToken, String refreshToken, String nickname) {
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .nickname(nickname)
                .build();
    }
}
