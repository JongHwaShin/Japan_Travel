package com.japantravel.dto.transport;

import com.japantravel.domain.TransportInfo;
import com.japantravel.domain.enums.TransportType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TransportResponse {

    private Long transportId;
    private Long regionId;
    private String regionNameKo;
    private TransportType type;
    private String nameKo;
    private String nameJp;
    private String description;
    private String price;
    private String tip;

    public static TransportResponse from(TransportInfo transport) {
        return TransportResponse.builder()
                .transportId(transport.getTransportId())
                .regionId(transport.getRegion() != null ? transport.getRegion().getRegionId() : null)
                .regionNameKo(transport.getRegion() != null ? transport.getRegion().getNameKo() : null)
                .type(transport.getType())
                .nameKo(transport.getNameKo())
                .nameJp(transport.getNameJp())
                .description(transport.getDescription())
                .price(transport.getPrice())
                .tip(transport.getTip())
                .build();
    }
}
