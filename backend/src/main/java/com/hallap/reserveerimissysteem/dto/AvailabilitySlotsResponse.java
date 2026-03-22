package com.hallap.reserveerimissysteem.dto;

import java.time.Instant;
import java.util.List;

public record AvailabilitySlotsResponse(
        String requestedTime,
        List<AvailabilitySlot> slots,
        Instant generatedAt
) {
}
