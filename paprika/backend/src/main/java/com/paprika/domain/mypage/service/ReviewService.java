package com.paprika.domain.mypage.service;

import com.paprika.domain.mypage.dto.MannerTemperatureResponse;
import com.paprika.domain.mypage.dto.ReviewCreateRequest;
import com.paprika.domain.mypage.dto.ReviewResponse;
import com.paprika.domain.mypage.entity.MannerTemperature;
import com.paprika.domain.mypage.entity.MyPageUser;
import com.paprika.domain.mypage.entity.Review;
import com.paprika.domain.mypage.repository.MyPageUserRepository;
import com.paprika.domain.mypage.repository.ReviewRepository;
import com.paprika.domain.transaction.entity.Transaction;
import com.paprika.domain.transaction.entity.Transaction.TransactionStatus;
import com.paprika.domain.transaction.repository.TransactionRepository;
import com.paprika.domain.mypage.repository.MannerTemperatureRepository;
import com.paprika.global.exception.ErrorCode;
import com.paprika.global.exception.PaprikaException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 담당: E - 장인호
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TransactionRepository transactionRepository;
    private final MannerTemperatureRepository mannerTemperatureRepository;
    private final MyPageUserRepository myPageUserRepository;

    public ReviewResponse createReview(Long reviewerId, ReviewCreateRequest request) {
        // 거래 조회
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new PaprikaException(ErrorCode.TRANSACTION_NOT_FOUND));

        // 구매자 본인 확인
        if (!transaction.getBuyerId().equals(reviewerId))
            throw new PaprikaException(ErrorCode.TRANSACTION_ACCESS_DENIED);

        // 거래완료 상태 확인
        if (transaction.getStatus() != TransactionStatus.COMPLETED)
            throw new PaprikaException(ErrorCode.INVALID_TRANSACTION_STATUS);

        // 중복 리뷰 확인
        if (reviewRepository.existsByTransactionIdAndReviewerId(request.getTransactionId(), reviewerId))
            throw new PaprikaException(ErrorCode.REVIEW_ALREADY_EXISTS);

        // mannerScore 계산
        int mannerScore = calcMannerScore(request.getRating());

        // 리뷰 저장
        Review review = Review.of(
                request.getTransactionId(),
                reviewerId,
                transaction.getSellerId(),
                request.getRating(),
                mannerScore,
                request.getContent()
        );
        reviewRepository.save(review);

        MannerTemperature mt = mannerTemperatureRepository.findByUserId(transaction.getSellerId())
                .orElse(MannerTemperature.defaultFor(transaction.getSellerId()));
        mt.applyScore(mannerScore);
        mannerTemperatureRepository.save(mt);

        String reviewerNickname = myPageUserRepository.findById(reviewerId)
                .map(MyPageUser::getNickname)
                .orElse(null);

        return ReviewResponse.from(review, reviewerNickname);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByUserId(Long userId) {
        List<Review> reviews = reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId);

        List<Long> reviewerIds = reviews.stream()
                .map(Review::getReviewerId)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, String> nicknameByReviewerId = myPageUserRepository.findAllById(reviewerIds)
                .stream()
                .collect(Collectors.toMap(MyPageUser::getId, MyPageUser::getNickname));

        return reviews.stream()
                .map(review -> ReviewResponse.from(review, nicknameByReviewerId.get(review.getReviewerId())))
                .collect(Collectors.toList());
    }

    private int calcMannerScore(int rating) {
        return switch (rating) {
            case 5 -> 2;
            case 4 -> 1;
            case 3 -> 0;
            case 2 -> -1;   
            case 1 -> -2;
            default -> throw new PaprikaException(ErrorCode.INVALID_RATING);
        };
    }
    @Transactional(readOnly = true)
    public MannerTemperatureResponse getMannerTemperature(Long userId) {
        return mannerTemperatureRepository.findByUserId(userId)
                .map(MannerTemperatureResponse::from)
                .orElse(MannerTemperatureResponse.defaultResponse(userId));
    }
}