package com.paprika.domain.post.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post postId;

    @Column
    private String imgUrl;

    /**
     * enable -> isActive 로 변경
     * 사용자 요청에서 image 가 delete 되면 isActive = false
     * 이후, 배치 작업에서
     * 1) isActive = false 인 데이터에 대해 delete_scheduled_at 데이터 update
     * 2) delete_scheduled_at 에 대해 overdue 인 것에 대해 삭제
     */
    @Column(nullable = false)
    private boolean isActive = true;

    @Column
    private OffsetDateTime deleteScheduledAt;

    /**
     * 삭제 예정일 : 현재 + 7일
     * 
     * @param scheduledAt
     */
    public void softDelete() {
        this.isActive = false;
        this.deleteScheduledAt = OffsetDateTime.now().plusDays(7);
    }
}
