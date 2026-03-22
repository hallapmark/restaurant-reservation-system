package com.hallap.reserveerimissysteem.dto;

public record AvailabilitySlot(
        String time,
        int availableTableCount,
        String topRecommendationId
) {
}
