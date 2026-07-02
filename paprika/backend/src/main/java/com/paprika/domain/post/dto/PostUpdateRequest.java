package com.paprika.domain.post.dto;

import java.util.List;

public record PostUpdateRequest(
        String title,
        String content,
        double latitude,
        double longitude,
        List<String> imgUrls,
        String currentPrice) {

}
