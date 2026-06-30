package com.paprika.domain.mypage.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 프로필 수정 요청 DTO
 * 담당: E - 장인호
 *
 * - nickname: 변경할 닉네임 (null이면 수정 안 함)
 * - profileImageUrl: 변경할 프로필 이미지 URL (null이면 수정 안 함)
 */
@Getter
@NoArgsConstructor
public class ProfileUpdateRequest {
    private String nickname;
    private String profileImageUrl;
}