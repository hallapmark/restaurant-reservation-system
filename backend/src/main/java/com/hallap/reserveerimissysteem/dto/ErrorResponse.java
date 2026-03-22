package com.hallap.reserveerimissysteem.dto;

import java.util.List;

public record ErrorResponse(
        int status,
        String message,
        List<String> details
) {
}
