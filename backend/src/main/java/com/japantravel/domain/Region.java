package com.japantravel.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "regions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "region_id")
    private Long regionId;

    @Column(name = "name_ko", nullable = false, length = 50)
    private String nameKo;

    @Column(name = "name_jp", length = 50)
    private String nameJp;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "region", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Place> places = new ArrayList<>();

    @OneToMany(mappedBy = "region", fetch = FetchType.LAZY)
    @Builder.Default
    private List<TravelLog> travelLogs = new ArrayList<>();

    @OneToMany(mappedBy = "region", fetch = FetchType.LAZY)
    @Builder.Default
    private List<TransportInfo> transportInfos = new ArrayList<>();
}
