package com.hallap.reserveerimissysteem.dto;

import java.time.Instant;
import java.util.Map;

public record AvailabilityResponse(
        Map<String, AvailabilityStatus> tableStatusById,
        Instant generatedAt
) {
}
