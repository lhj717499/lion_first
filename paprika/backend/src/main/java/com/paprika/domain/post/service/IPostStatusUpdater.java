package com.paprika.domain.post.service;

/**
 * PENDING, AGREED, COMPLETE , CANCELED
 * 
 * @param postId
 */
public interface IPostStatusUpdater {
    void reservePost(Long postId);

    void soldPost(Long postId);

    void sellingPostAsCanceled(Long postId);
}
