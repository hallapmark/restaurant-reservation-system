package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.AvailabilitySlot;
import com.hallap.reserveerimissysteem.dto.AvailabilitySlotsRequest;
import com.hallap.reserveerimissysteem.dto.AvailabilitySlotsResponse;
import com.hallap.reserveerimissysteem.dto.AvailabilityStatus;
import com.hallap.reserveerimissysteem.dto.RecommendationsRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class AvailabilitySlotsService {
    private static final LocalTime OPENING_TIME = LocalTime.of(11, 0);
    private static final LocalTime LAST_START_TIME = LocalTime.of(20, 0);
    private static final int SLOT_STEP_MINUTES = 30;
    private static final int MAX_SLOTS = 7;

    private final AvailabilityService availabilityService;
    private final RecommendationService recommendationService;

    public AvailabilitySlotsService(
            AvailabilityService availabilityService,
            RecommendationService recommendationService
    ) {
        this.availabilityService = availabilityService;
        this.recommendationService = recommendationService;
    }

    public AvailabilitySlotsResponse getAvailabilitySlots(AvailabilitySlotsRequest request) {
        LocalDate date = LocalDate.parse(request.date());
        LocalTime requestedTime = LocalTime.parse(request.time());

        List<SlotCandidate> nearestSlots = buildCandidateTimes().stream()
                .map(candidateTime -> buildSlotCandidate(request, date, candidateTime))
                .filter(candidate -> candidate.availableTableCount() > 0)
                .sorted(Comparator
                        .comparingLong((SlotCandidate candidate) ->
                                Math.abs(candidate.time().toSecondOfDay() - requestedTime.toSecondOfDay()))
                        .thenComparing(SlotCandidate::time))
                .limit(MAX_SLOTS)
                .sorted(Comparator.comparing(SlotCandidate::time))
                .toList();

        List<AvailabilitySlot> slots = nearestSlots.stream()
                .map(candidate -> new AvailabilitySlot(
                        candidate.time().toString(),
                        candidate.availableTableCount(),
                        candidate.topRecommendationId()
                ))
                .toList();

        return new AvailabilitySlotsResponse(request.time(), slots, Instant.now());
    }

    private SlotCandidate buildSlotCandidate(
            AvailabilitySlotsRequest request,
            LocalDate date,
            LocalTime candidateTime
    ) {
        Map<String, AvailabilityStatus> statusById = availabilityService.calculateAvailability(
                request.plan(),
                date,
                candidateTime,
                request.partySize(),
                request.zone(),
                request.accessibleRequired()
        );

        int availableTableCount = (int) statusById.values().stream()
                .filter(status -> status == AvailabilityStatus.AVAILABLE)
                .count();

        if (availableTableCount == 0) {
            return new SlotCandidate(candidateTime, 0, null);
        }

        String topRecommendationId = recommendationService.getRecommendations(new RecommendationsRequest(
                request.date(),
                candidateTime.toString(),
                request.partySize(),
                request.plan(),
                request.zone(),
                request.accessibleRequired(),
                request.preferences()
        )).topRecommendationId();

        return new SlotCandidate(candidateTime, availableTableCount, topRecommendationId);
    }

    private List<LocalTime> buildCandidateTimes() {
        java.util.ArrayList<LocalTime> candidateTimes = new java.util.ArrayList<>();
        for (LocalTime time = OPENING_TIME; !time.isAfter(LAST_START_TIME); time = time.plusMinutes(SLOT_STEP_MINUTES)) {
            candidateTimes.add(time);
        }
        return List.copyOf(candidateTimes);
    }

    private record SlotCandidate(
            LocalTime time,
            int availableTableCount,
            String topRecommendationId
    ) {
    }
}
