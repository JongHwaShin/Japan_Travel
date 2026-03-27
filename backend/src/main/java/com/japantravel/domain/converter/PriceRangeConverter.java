package com.japantravel.domain.converter;

import com.japantravel.domain.enums.PriceRange;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;

/**
 * DB 컬럼 ENUM('₩','₩₩','₩₩₩')과 Java enum PriceRange(LOW/MEDIUM/HIGH)의
 * 이름 불일치를 해결하는 JPA AttributeConverter.
 *
 * DB 저장값 : ₩  ₩₩  ₩₩₩
 * Java enum : LOW MEDIUM HIGH
 */
@Converter(autoApply = true)
public class PriceRangeConverter implements AttributeConverter<PriceRange, String> {

    @Override
    public String convertToDatabaseColumn(PriceRange attribute) {
        if (attribute == null) return null;
        return attribute.getSymbol();   // LOW → "₩", MEDIUM → "₩₩", HIGH → "₩₩₩"
    }

    @Override
    public PriceRange convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        return Arrays.stream(PriceRange.values())
                .filter(p -> p.getSymbol().equals(dbData))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "알 수 없는 PriceRange DB 값: " + dbData));
    }
}
