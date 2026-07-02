package com.paprika.domain.transaction.client;

import com.paprika.domain.post.entity.Post;
import com.paprika.domain.post.entity.Post.PostStatus;
import com.paprika.domain.post.repository.PostRepository;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * PostStatusClient 실제 구현 (post 테이블 상태 변경)
 * 담당: D - 이동준
 *
 * 거래 이벤트에 맞춰 post.post_status를 갱신한다.
 *  - AGREED    -> RESERVED
 *  - COMPLETED -> SOLD
 *  - CANCELLED -> SELLING (복구)
 */
@Primary
@Component
public class PostStatusClientJpa implements PostStatusClient {

    private final PostRepository postRepository;

    public PostStatusClientJpa(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override
    @Transactional
    public void markReserved(Long postId) {
        updateStatus(postId, PostStatus.RESERVED);
    }

    @Override
    @Transactional
    public void markSold(Long postId) {
        updateStatus(postId, PostStatus.SOLD);
    }

    @Override
    @Transactional
    public void markSelling(Long postId) {
        updateStatus(postId, PostStatus.SELLING);
    }

    private void updateStatus(Long postId, PostStatus status) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다. postId=" + postId));
        post.updateStatus(status);
    }
}
