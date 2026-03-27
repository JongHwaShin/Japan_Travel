package com.japantravel.domain;

import com.japantravel.domain.enums.TransportType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transport_info")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class TransportInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transport_id")
    private Long transportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id")
    private Region region;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransportType type;

    @Column(name = "name_ko", nullable = false, length = 100)
    private String nameKo;

    @Column(name = "name_jp", length = 100)
    private String nameJp;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String price;

    @Column(columnDefinition = "TEXT")
    private String tip;
}
