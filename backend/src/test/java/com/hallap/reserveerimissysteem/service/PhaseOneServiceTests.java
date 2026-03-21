package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class PhaseOneServiceTests {
    @Autowired
    private LayoutService layoutService;

    @Autowired
    private AvailabilityService availabilityService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private OccupancyService occupancyService;

    @Test
    void layoutSeedLoadsAndPrivateTablesStayOnIndoorPlan() {
        LayoutResponse layout = layoutService.getLayout();

        assertThat(layout.plans()).extracting(LayoutResponse.PlanSummary::code)
                .containsExactlyInAnyOrder(PlanCode.INDOOR, PlanCode.TERRACE);
        assertThat(layout.zones()).extracting(LayoutResponse.ZoneSummary::code)
                .containsExactlyInAnyOrder(Zone.INDOOR, Zone.TERRACE, Zone.PRIVATE);
        assertThat(layout.features()).extracting(LayoutResponse.LayoutFeature::type)
                .contains(FeatureType.PRIVATE_ROOM, FeatureType.PLAY_AREA, FeatureType.WINDOW_BAND);
        assertThat(layout.tables())
                .filteredOn(table -> table.zone() == Zone.PRIVATE)
                .allMatch(table -> table.plan() == PlanCode.INDOOR);
    }

    @Test
    void occupancyIsDeterministicForSameTimeslotAndVariesAcrossTimes() {
        List<LayoutResponse.TableGeometry> indoorTables = layoutService.getTablesForPlan(PlanCode.INDOOR);
        LocalDate date = LocalDate.of(2026, 3, 21);
        LocalTime dinnerTime = LocalTime.of(19, 0);

        Set<String> first = occupancyService.getReservedTableIds(PlanCode.INDOOR, date, dinnerTime, indoorTables);
        Set<String> second = occupancyService.getReservedTableIds(PlanCode.INDOOR, date, dinnerTime, indoorTables);

        assertThat(first).isEqualTo(second);

        boolean hasDifferentPattern = List.of(
                        LocalTime.of(12, 0),
                        LocalTime.of(14, 0),
                        LocalTime.of(16, 0),
                        LocalTime.of(22, 0)
                ).stream()
                .map(time -> occupancyService.getReservedTableIds(PlanCode.INDOOR, date, time, indoorTables))
                .anyMatch(reservedIds -> !reservedIds.equals(first));

        assertThat(hasDifferentPattern).isTrue();
    }

    @Test
    void availabilityUsesReservationSuitabilityAndSelectedPlan() {
        LocalDate date = LocalDate.of(2026, 3, 21);
        LocalTime time = LocalTime.of(19, 0);
        int partySize = 4;
        Zone zone = Zone.INDOOR;

        Map<String, AvailabilityStatus> statuses = availabilityService.calculateAvailability(
                PlanCode.INDOOR,
                date,
                time,
                partySize,
                zone
        );
        List<LayoutResponse.TableGeometry> indoorTables = layoutService.getTablesForPlan(PlanCode.INDOOR);
        Set<String> reservedIds = occupancyService.getReservedTableIds(PlanCode.INDOOR, date, time, indoorTables);

        assertThat(statuses.keySet()).containsExactlyInAnyOrderElementsOf(
                indoorTables.stream().map(LayoutResponse.TableGeometry::tableId).toList()
        );

        for (LayoutResponse.TableGeometry table : indoorTables) {
            AvailabilityStatus expected = reservedIds.contains(table.tableId())
                    ? AvailabilityStatus.RESERVED
                    : (table.capacity() < partySize || table.zone() != zone
                    ? AvailabilityStatus.UNAVAILABLE
                    : AvailabilityStatus.AVAILABLE);

            assertThat(statuses.get(table.tableId())).isEqualTo(expected);
        }
    }

    @Test
    void recommendationsOnlyContainAvailableTables() {
        RecommendationsRequest request = new RecommendationsRequest(
                "2026-03-21",
                "19:00",
                4,
                PlanCode.INDOOR,
                Zone.INDOOR,
                List.of(Preference.WINDOW)
        );

        RecommendationsResponse recommendations = recommendationService.getRecommendations(request);
        Map<String, AvailabilityStatus> statuses = availabilityService.calculateAvailability(
                request.plan(),
                LocalDate.parse(request.date()),
                LocalTime.parse(request.time()),
                request.partySize(),
                request.zone()
        );

        assertThat(recommendations.recommendations())
                .allSatisfy(recommendation ->
                        assertThat(statuses.get(recommendation.tableId())).isEqualTo(AvailabilityStatus.AVAILABLE));
    }

    @Test
    void smallerMatchingCapacityOutranksOversizedTableWhenPreferencesMatch() {
        LocalTime matchingTime = findTimeWithAvailableTables(
                PlanCode.TERRACE,
                2,
                Zone.TERRACE,
                List.of("T5", "T6")
        );

        RecommendationsResponse response = recommendationService.getRecommendations(new RecommendationsRequest(
                "2026-03-21",
                matchingTime.toString(),
                2,
                PlanCode.TERRACE,
                Zone.TERRACE,
                List.of()
        ));

        assertThat(indexOf(response, "T5")).isLessThan(indexOf(response, "T6"));
    }

    @Test
    void preferenceMatchingTableOutranksNonMatchingTableWhenCapacityFitIsSimilar() {
        LocalTime matchingTime = findTimeWithAvailableTables(
                PlanCode.INDOOR,
                4,
                Zone.INDOOR,
                List.of("T2", "T3")
        );

        RecommendationsResponse response = recommendationService.getRecommendations(new RecommendationsRequest(
                "2026-03-21",
                matchingTime.toString(),
                4,
                PlanCode.INDOOR,
                Zone.INDOOR,
                List.of(Preference.WINDOW)
        ));

        assertThat(indexOf(response, "T3")).isLessThan(indexOf(response, "T2"));
    }

    @Test
    void returnsEmptyRecommendationsWhenNoCandidatesExist() {
        RecommendationsResponse response = recommendationService.getRecommendations(new RecommendationsRequest(
                "2026-03-21",
                "19:00",
                10,
                PlanCode.TERRACE,
                Zone.TERRACE,
                List.of(Preference.ACCESSIBLE)
        ));

        assertThat(response.topRecommendationId()).isNull();
        assertThat(response.recommendations()).isEmpty();
    }

    private LocalTime findTimeWithAvailableTables(
            PlanCode plan,
            int partySize,
            Zone zone,
            List<String> requiredTableIds
    ) {
        LocalDate date = LocalDate.of(2026, 3, 21);
        List<LocalTime> candidateTimes = List.of(
                LocalTime.of(11, 0),
                LocalTime.of(12, 0),
                LocalTime.of(13, 0),
                LocalTime.of(15, 0),
                LocalTime.of(17, 0),
                LocalTime.of(19, 0),
                LocalTime.of(21, 0),
                LocalTime.of(22, 0)
        );

        for (LocalTime candidateTime : candidateTimes) {
            Map<String, AvailabilityStatus> statuses = availabilityService.calculateAvailability(
                    plan,
                    date,
                    candidateTime,
                    partySize,
                    zone
            );
            boolean allAvailable = requiredTableIds.stream()
                    .allMatch(tableId -> statuses.get(tableId) == AvailabilityStatus.AVAILABLE);
            if (allAvailable) {
                return candidateTime;
            }
        }

        throw new AssertionError("Could not find a deterministic test timeslot for " + requiredTableIds);
    }

    private int indexOf(RecommendationsResponse response, String tableId) {
        return response.recommendations().stream()
                .map(Recommendation::tableId)
                .toList()
                .indexOf(tableId);
    }
}
