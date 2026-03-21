package com.hallap.reserveerimissysteem.controller;

import com.hallap.reserveerimissysteem.dto.*;
import com.hallap.reserveerimissysteem.service.AvailabilityService;
import com.hallap.reserveerimissysteem.service.LayoutService;
import com.hallap.reserveerimissysteem.service.RecommendationService;
import com.hallap.reserveerimissysteem.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

// This Controller has been written by me except where noted otherwise. - Mark

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReservationApiController {
    private final LayoutService layoutService;
    private final AvailabilityService availabilityService;
    private final RecommendationService recommendationService;
    private final ReservationService reservationService;

    @GetMapping("/layout")
    public LayoutResponse getLayout() {
        return layoutService.getLayout();
    }

    @PostMapping("/availability")
    public AvailabilityResponse checkAvailability(
            @Valid @RequestBody AvailabilityRequest availabilityRequest
    ) {
        return availabilityService.getAvailability(availabilityRequest);
    }

    @PostMapping("/recommendations")
    public RecommendationsResponse getRecommendations(
            @Valid @RequestBody RecommendationsRequest recommendationsRequest
    ) {
        return recommendationService.getRecommendations(recommendationsRequest);
    }

    @PostMapping("/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse makeReservation(
            @Valid @RequestBody ReservationRequest reservationRequest
    ) {
        return reservationService.createReservation(reservationRequest);
    }

    @GetMapping("/reservations/{id}")
    public ReservationResponse getReservation(@PathVariable String id) {
        return reservationService.getReservation(id);
    }
}
