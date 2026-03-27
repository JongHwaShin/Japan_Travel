package com.japantravel.service;

import com.japantravel.domain.ExchangeRate;
import com.japantravel.dto.exchange.ExchangeRateResponse;
import com.japantravel.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExchangeService {

    private static final long CACHE_TTL_MINUTES = 60;
    private static final String API_URL = "https://open.er-api.com/v6/latest/{base}";

    private final ExchangeRateRepository exchangeRateRepository;
    private final RestTemplate restTemplate;

    /**
     * 환율 조회
     * - 1시간 이내 DB 캐시 존재 시 DB 반환
     * - 만료 또는 없으면 외부 API 호출 후 DB 저장
     */
    @Transactional
    public ExchangeRateResponse getExchangeRate(String fromCurrency, String toCurrency) {
        log.info("[ExchangeService] getExchangeRate 시작 - {}→{}", fromCurrency, toCurrency);

        Optional<ExchangeRate> cached =
                exchangeRateRepository.findByFromCurrencyAndToCurrency(fromCurrency, toCurrency);

        if (cached.isPresent()) {
            ExchangeRate cachedRate = cached.get();
            LocalDateTime expiredAt = cachedRate.getUpdatedAt().plusMinutes(CACHE_TTL_MINUTES);

            if (LocalDateTime.now().isBefore(expiredAt)) {
                log.info("[ExchangeService] DB 캐시 사용 - {}→{}, rate: {}, 캐시 만료: {}",
                        fromCurrency, toCurrency, cachedRate.getRate(), expiredAt);
                return ExchangeRateResponse.of(cachedRate, true);
            }
            log.warn("[ExchangeService] DB 캐시 만료 - {}→{}, 외부 API 호출", fromCurrency, toCurrency);
        } else {
            log.info("[ExchangeService] 캐시 없음 - {}→{}, 외부 API 호출", fromCurrency, toCurrency);
        }

        BigDecimal freshRate = fetchRateFromApi(fromCurrency, toCurrency);
        ExchangeRate saved = saveOrUpdate(fromCurrency, toCurrency, freshRate, cached);

        log.info("[ExchangeService] getExchangeRate 완료 - {}→{}, rate: {}", fromCurrency, toCurrency, freshRate);
        return ExchangeRateResponse.of(saved, false);
    }

    private BigDecimal fetchRateFromApi(String fromCurrency, String toCurrency) {
        log.info("[ExchangeService] 외부 API 호출 시작 - base: {}", fromCurrency);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(
                    API_URL, Map.class, fromCurrency);

            if (response == null || !"success".equals(response.get("result"))) {
                log.warn("[ExchangeService] 외부 API 응답 비정상 - result: {}",
                        response != null ? response.get("result") : "null");
                throw new RuntimeException("외부 환율 API 응답이 올바르지 않습니다.");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> rates = (Map<String, Object>) response.get("rates");

            if (rates == null || !rates.containsKey(toCurrency)) {
                log.warn("[ExchangeService] 환율 정보 없음 - toCurrency: {}", toCurrency);
                throw new IllegalArgumentException("지원하지 않는 통화입니다: " + toCurrency);
            }

            BigDecimal rate = new BigDecimal(rates.get(toCurrency).toString());
            log.info("[ExchangeService] 외부 API 호출 완료 - {}→{}, rate: {}", fromCurrency, toCurrency, rate);
            return rate;

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("[ExchangeService] 외부 API 호출 실패 - {}→{}", fromCurrency, toCurrency, e);
            throw new RuntimeException("환율 정보를 가져오는 데 실패했습니다.");
        }
    }

    private ExchangeRate saveOrUpdate(String fromCurrency, String toCurrency,
                                      BigDecimal rate, Optional<ExchangeRate> existing) {
        if (existing.isPresent()) {
            log.info("[ExchangeService] 캐시 업데이트 - {}→{}", fromCurrency, toCurrency);
            ExchangeRate updated = ExchangeRate.builder()
                    .rateId(existing.get().getRateId())
                    .fromCurrency(fromCurrency)
                    .toCurrency(toCurrency)
                    .rate(rate)
                    .build();
            return exchangeRateRepository.save(updated);
        } else {
            log.info("[ExchangeService] 캐시 신규 저장 - {}→{}", fromCurrency, toCurrency);
            ExchangeRate newRate = ExchangeRate.builder()
                    .fromCurrency(fromCurrency)
                    .toCurrency(toCurrency)
                    .rate(rate)
                    .build();
            return exchangeRateRepository.save(newRate);
        }
    }
}
