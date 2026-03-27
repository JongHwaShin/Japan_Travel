package com.japantravel.dto.exchange;

import com.japantravel.domain.ExchangeRate;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ExchangeRateResponse {

    private String fromCurrency;
    private String toCurrency;
    private BigDecimal rate;
    private LocalDateTime updatedAt;
    private boolean cached;

    public static ExchangeRateResponse of(ExchangeRate exchangeRate, boolean cached) {
        return ExchangeRateResponse.builder()
                .fromCurrency(exchangeRate.getFromCurrency())
                .toCurrency(exchangeRate.getToCurrency())
                .rate(exchangeRate.getRate())
                .updatedAt(exchangeRate.getUpdatedAt())
                .cached(cached)
                .build();
    }

    public static ExchangeRateResponse ofFresh(String fromCurrency, String toCurrency,
                                               BigDecimal rate, LocalDateTime updatedAt) {
        return ExchangeRateResponse.builder()
                .fromCurrency(fromCurrency)
                .toCurrency(toCurrency)
                .rate(rate)
                .updatedAt(updatedAt)
                .cached(false)
                .build();
    }
}
