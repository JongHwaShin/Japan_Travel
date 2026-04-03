package com.japantravel.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS   = 5;
    private static final int BLOCK_MINUTES  = 30;

    private final ConcurrentHashMap<String, AttemptInfo> attempts = new ConcurrentHashMap<>();

    /** 해당 IP가 현재 차단 상태인지 확인 */
    public boolean isBlocked(String ip) {
        AttemptInfo info = attempts.get(ip);
        if (info == null) return false;

        if (info.isBlocked()) {
            log.warn("[LoginAttemptService] 차단된 IP 접근 - IP: {}, 차단 해제: {}", ip, info.blockUntil);
            return true;
        }

        // 차단 기간이 만료된 경우 초기화
        attempts.remove(ip);
        return false;
    }

    /** 로그인 실패 처리 - 횟수 증가, MAX_ATTEMPTS 도달 시 차단 */
    public void loginFailed(String ip) {
        AttemptInfo info = attempts.merge(ip, new AttemptInfo(1, null),
                (existing, newVal) -> new AttemptInfo(existing.count + 1, existing.blockUntil));

        if (info.count >= MAX_ATTEMPTS && !info.isBlocked()) {
            Instant blockUntil = Instant.now().plusSeconds(BLOCK_MINUTES * 60L);
            attempts.put(ip, new AttemptInfo(info.count, blockUntil));
            log.warn("[LoginAttemptService] IP 차단 - IP: {}, 실패 횟수: {}, 해제 시각: {}",
                    ip, info.count, blockUntil);
        } else {
            log.warn("[LoginAttemptService] 로그인 실패 누적 - IP: {}, 횟수: {}/{}",
                    ip, info.count, MAX_ATTEMPTS);
        }
    }

    /** 로그인 성공 시 실패 기록 초기화 */
    public void loginSucceeded(String ip) {
        if (attempts.remove(ip) != null) {
            log.info("[LoginAttemptService] 로그인 성공 - IP: {} 실패 기록 초기화", ip);
        }
    }

    private record AttemptInfo(int count, Instant blockUntil) {
        boolean isBlocked() {
            return blockUntil != null && Instant.now().isBefore(blockUntil);
        }
    }
}
