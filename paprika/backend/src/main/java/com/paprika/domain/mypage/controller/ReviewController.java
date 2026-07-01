package com.paprika.domain.mypage.controller;

import com.paprika.domain.mypage.dto.MannerTemperatureResponse;
import com.paprika.domain.mypage.dto.ReviewCreateRequest;
import com.paprika.domain.mypage.dto.ReviewResponse;
import com.paprika.domain.mypage.service.ReviewService;
import com.paprika.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 담당: E - 장인호
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 작성
    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewCreateRequest request,
            Authentication authentication) {
        Long reviewerId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(reviewService.createReview(reviewerId, request)));
    }

    // 특정 유저 받은 리뷰 조회
    @GetMapping("/users/{userId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsByUserId(userId)));
    }
    // TODO: 내 매너온도 조회 추가
    @GetMapping("/users/{userId}/manner")
    public ResponseEntity<ApiResponse<MannerTemperatureResponse>> getMannerTemperature(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getMannerTemperature(userId)));
    }
}