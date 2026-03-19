package com.hallap.reserveerimissysteem.dto;

import java.time.Instant;

public record ReservationResponse(
        String reservationId,
        String tableId,
        String date,
        String time,
        int partySize,
        ReservationStatus status,
        Instant createdAt,
        String message
) {
}
