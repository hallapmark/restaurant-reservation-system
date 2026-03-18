package com.hallap.reserveerimissysteem.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReservationApiController {

    @GetMapping("/layout")
    public LayoutResponse getLayout() {
        return new LayoutResponse();
    }

    @PostMapping("/availability")
    public AvailabilityResponse checkAvailability(
            @RequestBody AvailabilityRequest availabilityRequest
    ) {
        return new AvailabilityResponse();
    }

    @PostMapping("/recommendations")
    public RecommendationsResponse getRecommendations(
            @RequestBody RecommendationsRequest recommendationsRequest
    ) {
        return new RecommendationsResponse();
    }

    @PostMapping("/reservations")
    public ReservationResponse makeReservation(
            @RequestBody ReservationRequest reservationRequest
    ) {
        return new ReservationResponse();
    }

    @GetMapping("/reservations/{id}")
    public ReservationResponse getReservation(@PathVariable String id) {
        return new ReservationResponse();
    }
}
