package com.japantravel.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "log_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class LogImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_id", nullable = false)
    private TravelLog travelLog;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;
}
