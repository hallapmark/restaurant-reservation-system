package com.hallap.reserveerimissysteem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record AvailabilitySlotsRequest(
        @NotBlank String date,
        @NotBlank @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$") String time,
        @Min(1) int partySize,
        @NotNull PlanCode plan,
        Zone zone,
        boolean accessibleRequired,
        List<RecommendationPreference> preferences
) {
}
