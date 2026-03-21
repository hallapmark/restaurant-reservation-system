package com.hallap.reserveerimissysteem.dto;

import java.util.List;

public record LayoutResponse(
        String layoutId,
        double venueWidthMeters,
        double venueHeightMeters,
        List<PlanSummary> plans,
        List<ZoneSummary> zones,
        List<LayoutFeature> features,
        List<TableGeometry> tables
) {

    public record PlanSummary(
            PlanCode code,
            String label,
            String description
    ) {
    }

    public record ZoneSummary(
            Zone code,
            String label,
            String description
    ) {
    }

    public record Point(
            double x,
            double y
    ) {
    }

    public record LayoutFeature(
            String featureId,
            PlanCode plan,
            FeatureType type,
            String label,
            Point center,
            double width,
            double height
    ) {
    }

    public record TableGeometry(
            String tableId,
            String label,
            int capacity,
            PlanCode plan,
            Zone zone,
            Point center,
            double width,
            double height,
            double rotationDegrees,
            boolean accessible,
            boolean nearWindow,
            boolean nearPlayArea,
            double privacyScore
    ) {
    }
}
