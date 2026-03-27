package com.japantravel.domain.enums;

public enum PriceRange {
    LOW("₩"),
    MEDIUM("₩₩"),
    HIGH("₩₩₩");

    private final String symbol;

    PriceRange(String symbol) {
        this.symbol = symbol;
    }

    public String getSymbol() {
        return symbol;
    }
}
