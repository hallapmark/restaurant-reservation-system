package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.AvailabilityStatus;
import com.hallap.reserveerimissysteem.dto.LayoutResponse;
import com.hallap.reserveerimissysteem.dto.Recommendation;
import com.hallap.reserveerimissysteem.dto.RecommendationPreference;
import com.hallap.reserveerimissysteem.dto.RecommendationsRequest;
import com.hallap.reserveerimissysteem.dto.RecommendationsResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class RecommendationService {
    private final LayoutService layoutService;
    private final AvailabilityService availabilityService;

    public RecommendationService(LayoutService layoutService, AvailabilityService availabilityService) {
        this.layoutService = layoutService;
        this.availabilityService = availabilityService;
    }

    public RecommendationsResponse getRecommendations(RecommendationsRequest request) {
        LocalDate date = LocalDate.parse(request.date());
        LocalTime time = LocalTime.parse(request.time());
        Map<String, AvailabilityStatus> statusById = availabilityService.calculateAvailability(
                request.plan(),
                date,
                time,
                request.partySize(),
                request.zone(),
                request.accessibleRequired()
        );
        List<RecommendationPreference> preferences =
                request.preferences() == null ? List.of() : List.copyOf(request.preferences());

        List<RecommendationCandidate> candidates = layoutService.getTablesForPlan(request.plan()).stream()
                .filter(table -> statusById.get(table.tableId()) == AvailabilityStatus.AVAILABLE)
                .map(table -> scoreTable(
                        table,
                        request.partySize(),
                        request.accessibleRequired(),
                        preferences
                ))
                .sorted(Comparator
                        .comparingDouble(RecommendationCandidate::score).reversed()
                        .thenComparing(Comparator.comparingInt(RecommendationCandidate::matchedPreferenceCount).reversed())
                        .thenComparingInt(candidate -> candidate.table().capacity())
                        .thenComparing(candidate -> candidate.table().tableId()))
                .toList();

        List<Recommendation> recommendations = candidates.stream()
                .map(candidate -> new Recommendation(candidate.table().tableId(), candidate.score(), candidate.reasons()))
                .toList();

        String topRecommendationId = recommendations.isEmpty() ? null : recommendations.getFirst().tableId();
        return new RecommendationsResponse(topRecommendationId, recommendations);
    }

    private RecommendationCandidate scoreTable(
            LayoutResponse.TableGeometry table,
            int partySize,
            boolean accessibleRequired,
            List<RecommendationPreference> preferences
    ) {
        double score = 100.0;
        int matchedPreferenceCount = 0;
        List<String> reasons = new ArrayList<>();

        int unusedSeats = Math.max(table.capacity() - partySize, 0);
        double efficiencyPenalty = getUnusedSeatPenalty(unusedSeats);
        score -= efficiencyPenalty;
        reasons.add(getEfficiencyReason(unusedSeats));

        if (accessibleRequired) {
            reasons.add("Vastab ligipääsetavuse nõudele.");
        }

        if (preferences.contains(RecommendationPreference.PRIVACY) && table.privacyScore() > 0.0) {
            score += 12.0 * table.privacyScore();
            matchedPreferenceCount++;
            reasons.add(table.privacyScore() >= 0.8
                    ? "Pakub väga head privaatsust."
                    : "Pakub arvestatavat privaatsust.");
        }

        if (preferences.contains(RecommendationPreference.WINDOW) && Boolean.TRUE.equals(table.nearWindow())) {
            score += 10.0;
            matchedPreferenceCount++;
            reasons.add("Asub akna lähedal.");
        }

        if (preferences.contains(RecommendationPreference.NEAR_PLAY_AREA) && Boolean.TRUE.equals(table.nearPlayArea())) {
            score += 10.0;
            matchedPreferenceCount++;
            reasons.add("Laste mängunurk on lähedal.");
        }

        double roundedScore = roundScore(Math.max(0.0, Math.min(100.0, score)));
        return new RecommendationCandidate(table, roundedScore, matchedPreferenceCount, List.copyOf(reasons));
    }

    private double getUnusedSeatPenalty(int unusedSeats) {
        return switch (unusedSeats) {
            case 0 -> 0.0;
            case 1 -> 5.0;
            case 2 -> 12.0;
            default -> 20.0;
        };
    }

    private String getEfficiencyReason(int unusedSeats) {
        return switch (unusedSeats) {
            case 0 -> "Mahutab seltskonna täpselt.";
            case 1 -> "Jätab ainult ühe koha varuks.";
            case 2 -> "Jätab kaks kohta varuks.";
            default -> "On sinu seltskonna jaoks pigem liiga suur laud.";
        };
    }

    private double roundScore(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private record RecommendationCandidate(
            LayoutResponse.TableGeometry table,
            double score,
            int matchedPreferenceCount,
            List<String> reasons
    ) {
    }
}
