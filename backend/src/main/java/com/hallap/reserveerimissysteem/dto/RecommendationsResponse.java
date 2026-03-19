package com.hallap.reserveerimissysteem.dto;

import java.util.List;

public record RecommendationsResponse(
        String topRecommendationId,
        List<Recommendation> recommendations
) {
}
