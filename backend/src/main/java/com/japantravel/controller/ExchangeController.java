package com.japantravel.controller;

import com.japantravel.dto.common.ApiResponse;
import com.japantravel.dto.exchange.ExchangeRateResponse;
import com.japantravel.service.ExchangeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/exchange")
@RequiredArgsConstructor
public class ExchangeController {

    private final ExchangeService exchangeService;

    /**
     * 환율 조회
     * GET /api/exchange?from=KRW&to=JPY
     */
    @GetMapping
    public ApiResponse<ExchangeRateResponse> getExchangeRate(
            @RequestParam String from,
            @RequestParam String to) {
        log.info("[ExchangeController] GET /api/exchange - from: {}, to: {}", from, to);
        ExchangeRateResponse result = exchangeService.getExchangeRate(from.toUpperCase(), to.toUpperCase());
        return ApiResponse.ok("환율 조회 성공", result);
    }
}
