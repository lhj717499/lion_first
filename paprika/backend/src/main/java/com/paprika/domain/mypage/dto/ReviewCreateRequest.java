package com.paprika.domain.mypage.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

/**
 * 리뷰 작성 요청 DTO
 * 담당: E - 장인호
 */
@Getter
public class ReviewCreateRequest {

    @NotNull
    private Long transactionId;

    private String content;

    @NotNull
    @Min(1) @Max(5)
    private Integer rating; // 1~5 (백엔드에서 mannerScore로 변환)
}
