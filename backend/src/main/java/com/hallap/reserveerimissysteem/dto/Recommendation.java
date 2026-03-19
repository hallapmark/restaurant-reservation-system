package com.hallap.reserveerimissysteem.dto;

import java.util.List;

public record Recommendation(
        String tableId,
        double score,
        List<String> reasons
) {
}
