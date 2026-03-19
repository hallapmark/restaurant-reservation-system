package com.hallap.reserveerimissysteem.dto;

import java.util.List;

public record LayoutResponse(
        String layoutId,
        double venueWidthMeters,
        double venueHeightMeters,
        List<ZoneSummary> zones,
        List<TableGeometry> tables
) {

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

    public record TableGeometry(
            String tableId,
            String label,
            int capacity,
            Zone zone,
            Point center,
            double width,
            double height,
            double rotationDegrees
    ) {
    }
}
