package com.japantravel.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class DeleteAccountRequest {

    @NotBlank(message = "비밀번호를 입력해주세요.")
    private String password;
}
