package com.paprika.domain.mypage.dto;

import com.paprika.domain.mypage.entity.MannerTemperature;
import lombok.Builder;
import lombok.Getter;

/**
 * 매너온도 응답 DTO
 * 담당: E - 장인호
 */
@Getter
@Builder
public class MannerTemperatureResponse {

    private Long userId;
    private Integer temperature;
    private String trustGrade;
    private Integer reviewCount;

    public static MannerTemperatureResponse from(MannerTemperature m) {
        return MannerTemperatureResponse.builder()
                .userId(m.getUserId())
                .temperature(m.getTemperature())
                .trustGrade(m.getTrustGrade())
                .reviewCount(m.getReviewCount())
                .build();
    }

    public static MannerTemperatureResponse defaultResponse(Long userId) {
        return MannerTemperatureResponse.builder()
                .userId(userId)
                .temperature(50)
                .trustGrade("보통")
                .reviewCount(0)
                .build();
    }
}