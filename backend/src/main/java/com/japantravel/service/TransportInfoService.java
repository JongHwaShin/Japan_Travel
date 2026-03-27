package com.japantravel.service;

import com.japantravel.domain.TransportInfo;
import com.japantravel.repository.TransportInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransportInfoService {

    private final TransportInfoRepository transportInfoRepository;

    @Transactional(readOnly = true)
    public List<TransportInfo> getTransportByRegion(Long regionId) {
        log.info("[TransportInfoService] getTransportByRegion 시작 - regionId: {}", regionId);

        List<TransportInfo> transports = transportInfoRepository.findByRegionId(regionId);
        log.info("[TransportInfoService] getTransportByRegion 완료 - regionId: {}, 조회 건수: {}", regionId, transports.size());
        return transports;
    }

    @Transactional(readOnly = true)
    public TransportInfo getTransportById(Long transportId) {
        log.info("[TransportInfoService] getTransportById 시작 - transportId: {}", transportId);

        TransportInfo transport = transportInfoRepository.findById(transportId)
                .orElseThrow(() -> {
                    log.warn("[TransportInfoService] 존재하지 않는 교통 정보 - transportId: {}", transportId);
                    return new IllegalArgumentException("존재하지 않는 교통 정보입니다.");
                });

        log.info("[TransportInfoService] getTransportById 완료 - transportId: {}", transportId);
        return transport;
    }

    @Transactional(readOnly = true)
    public List<TransportInfo> getAllTransport() {
        log.info("[TransportInfoService] getAllTransport 시작");

        List<TransportInfo> transports = transportInfoRepository.findAll();
        log.info("[TransportInfoService] getAllTransport 완료 - 조회 건수: {}", transports.size());
        return transports;
    }
}
