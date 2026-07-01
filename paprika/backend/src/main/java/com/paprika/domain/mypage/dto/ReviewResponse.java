package com.paprika.domain.mypage.dto;

import com.paprika.domain.mypage.entity.Review;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * 리뷰 응답 DTO
 * 담당: E - 장인호
 */
@Getter
@Builder
public class ReviewResponse {

    private Long id;
    private Long transactionId;
    private Long reviewerId;
    private String reviewerNickname;
    private Long revieweeId;
    private String content;
    private Integer mannerScore;
    private LocalDateTime createdAt;
    private Integer rating;

    public static ReviewResponse from(Review review, String reviewerNickname) {
        return ReviewResponse.builder()
            .id(review.getId())
            .transactionId(review.getTransactionId())
            .reviewerId(review.getReviewerId())
            .reviewerNickname(reviewerNickname)
            .revieweeId(review.getRevieweeId())
            .content(review.getContent())
            .mannerScore(review.getMannerScore())
            .createdAt(review.getCreatedAt())
            .rating(review.getRating())
            .build();
    }
}
