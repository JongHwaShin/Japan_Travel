package com.japantravel.domain;

import com.japantravel.domain.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Entity
@Table(name = "travel_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class TravelLog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id")
    private Region region;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "travel_date")
    private LocalDate travelDate;

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;

    @OneToMany(mappedBy = "travelLog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LogImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "travelLog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "travelLog", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Like> likes = new ArrayList<>();

    public void update(String title, String content, Boolean isPublic, LocalDate travelDate, Region region) {
        Optional.ofNullable(title).ifPresent(v -> this.title = v);
        Optional.ofNullable(content).ifPresent(v -> this.content = v);
        Optional.ofNullable(isPublic).ifPresent(v -> this.isPublic = v);
        Optional.ofNullable(travelDate).ifPresent(v -> this.travelDate = v);
        Optional.ofNullable(region).ifPresent(v -> this.region = v);
    }
}
