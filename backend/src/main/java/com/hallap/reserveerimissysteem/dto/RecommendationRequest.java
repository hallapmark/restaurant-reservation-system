package com.hallap.reserveerimissysteem.dto;

import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RecommendationRequest(
        @NotBlank String date,
        // 24h format HH:mm, e.g. "19:30"
        @NotBlank @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$") String time,
        @Min(1) int partySize,
        Zone zone,
        List<Preference> preferences
) {
}
