package com.paprika.domain.post.service;

public interface IPostStatusUpdater {
    void reservePost(Long postId);

    void sellingPostAsCanceled(Long postId);

    void soldPost(Long postId);
}
