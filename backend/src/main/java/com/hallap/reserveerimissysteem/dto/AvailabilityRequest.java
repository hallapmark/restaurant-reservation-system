package com.hallap.reserveerimissysteem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AvailabilityRequest(
        
        // yyyy-mm-dd
        @NotBlank String date,

        // 24h format time HH:mm, e.g. "19:30"
        // Note: does not allow H:mm (so 9:20 -> must be 09:20)
        // Slightly modified from
        // https://stackoverflow.com/questions/7536755/regular-expression-for-matching-hhmm-time-format
        @NotBlank @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$") String time,

        @Min(1) int partySize,
        @NotNull PlanCode plan,
        Zone zone
) {
}
