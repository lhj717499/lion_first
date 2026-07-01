package com.paprika.domain.mypage.repository;

import com.paprika.domain.mypage.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 담당: E - 장인호
 */
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    boolean existsByTransactionIdAndReviewerId(Long transactionId, Long reviewerId);
}
