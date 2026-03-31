package com.japantravel.dto.place;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PlacePageResponse {

    private List<PlaceResponse> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;
    private boolean hasNext;
    private boolean hasPrevious;
}
