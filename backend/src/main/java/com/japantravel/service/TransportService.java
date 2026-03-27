package com.japantravel.service;

import com.japantravel.dto.transport.TransportResponse;
import com.japantravel.repository.TransportInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransportService {

    private final TransportInfoRepository transportInfoRepository;

    /**
     * 전체 교통정보 목록 조회
     */
    @Transactional(readOnly = true)
    public List<TransportResponse> getAllTransports() {
        log.info("[TransportService] getAllTransports 시작");

        List<TransportResponse> result = transportInfoRepository.findAll()
                .stream().map(TransportResponse::from).toList();

        log.info("[TransportService] getAllTransports 완료 - 조회 건수: {}", result.size());
        return result;
    }

    /**
     * 지역별 교통정보 조회
     */
    @Transactional(readOnly = true)
    public List<TransportResponse> getTransportsByRegion(Long regionId) {
        log.info("[TransportService] getTransportsByRegion 시작 - regionId: {}", regionId);

        List<TransportResponse> result = transportInfoRepository.findByRegionId(regionId)
                .stream().map(TransportResponse::from).toList();

        log.info("[TransportService] getTransportsByRegion 완료 - regionId: {}, 조회 건수: {}", regionId, result.size());
        return result;
    }
}
