package com.paprika.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.paprika.domain.post.entity.PostImage;
import java.util.List;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    List<PostImage> findByPost_Id(Long id);

    List<PostImage> findByPost_IdAndActiveTrue(Long id);
}
