package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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

    @Autowired
    private AvailabilitySlotsService availabilitySlotsService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private RuntimeReservationStore runtimeReservationStore;

    @BeforeEach
    void clearRuntimeReservations() {
        runtimeReservationStore.clear();
    }

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
                zone,
                false
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
                false,
                List.of(RecommendationPreference.WINDOW)
        );

        RecommendationsResponse recommendations = recommendationService.getRecommendations(request);
        Map<String, AvailabilityStatus> statuses = availabilityService.calculateAvailability(
                request.plan(),
                LocalDate.parse(request.date()),
                LocalTime.parse(request.time()),
                request.partySize(),
                request.zone(),
                request.accessibleRequired()
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
                List.of("T8", "T6")
        );

        RecommendationsResponse response = recommendationService.getRecommendations(new RecommendationsRequest(
                "2026-03-21",
                matchingTime.toString(),
                2,
                PlanCode.TERRACE,
                Zone.TERRACE,
                false,
                List.of()
        ));

        assertThat(indexOf(response, "T8")).isLessThan(indexOf(response, "T6"));
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
                false,
                List.of(RecommendationPreference.WINDOW)
        ));

        assertThat(indexOf(response, "T3")).isLessThan(indexOf(response, "T2"));
    }

    @Test
    void availabilityMarksInaccessibleTablesUnavailableWhenAccessibilityIsRequired() {
        LocalTime matchingTime = findTimeWithStatuses(
                PlanCode.TERRACE,
                2,
                Zone.TERRACE,
                true,
                Map.of(
                        "T8", AvailabilityStatus.UNAVAILABLE,
                        "T9", AvailabilityStatus.UNAVAILABLE,
                        "T6", AvailabilityStatus.AVAILABLE
                )
        );

        Map<String, AvailabilityStatus> statuses = availabilityService.calculateAvailability(
                PlanCode.TERRACE,
                LocalDate.of(2026, 3, 21),
                matchingTime,
                2,
                Zone.TERRACE,
                true
        );

        assertThat(statuses.get("T8")).isEqualTo(AvailabilityStatus.UNAVAILABLE);
        assertThat(statuses.get("T9")).isEqualTo(AvailabilityStatus.UNAVAILABLE);
        assertThat(statuses.get("T6")).isEqualTo(AvailabilityStatus.AVAILABLE);
    }

    @Test
    void recommendationsExcludeInaccessibleTablesWhenAccessibilityIsRequired() {
        RecommendationsResponse response = recommendationService.getRecommendations(new RecommendationsRequest(
                "2026-03-21",
                "15:00",
                2,
                PlanCode.TERRACE,
                Zone.TERRACE,
                true,
                List.of()
        ));

        assertThat(response.recommendations())
                .extracting(Recommendation::tableId)
                .doesNotContain("T8", "T9");
    }

    @Test
    void availabilitySlotsReturnChronologicalNearbyMatchesForSelectedPlan() {
        AvailabilitySlotsResponse response = availabilitySlotsService.getAvailabilitySlots(new AvailabilitySlotsRequest(
                "2026-03-21",
                "19:00",
                4,
                PlanCode.INDOOR,
                null,
                false,
                List.of(RecommendationPreference.PRIVACY)
        ));

        assertThat(response.requestedTime()).isEqualTo("19:00");
        assertThat(response.slots()).hasSizeLessThanOrEqualTo(7);
        assertThat(response.slots())
                .allSatisfy(slot -> assertThat(slot.availableTableCount()).isGreaterThan(0));
        assertThat(response.slots())
                .extracting(AvailabilitySlot::time)
                .isSorted();
    }

    @Test
    void availabilitySlotsRespectAccessibilityRequirement() {
        AvailabilitySlotsResponse response = availabilitySlotsService.getAvailabilitySlots(new AvailabilitySlotsRequest(
                "2026-03-21",
                "15:00",
                2,
                PlanCode.TERRACE,
                Zone.TERRACE,
                true,
                List.of(RecommendationPreference.PRIVACY)
        ));

        assertThat(response.slots()).isNotEmpty();
        assertThat(response.slots())
                .allSatisfy(slot -> assertThat(slot.topRecommendationId()).isNotEqualTo("T8"));
    }

    @Test
    void returnsEmptyRecommendationsWhenNoAccessibleCandidatesExist() {
        RecommendationsResponse response = recommendationService.getRecommendations(new RecommendationsRequest(
                "2026-03-21",
                "19:00",
                8,
                PlanCode.INDOOR,
                Zone.PRIVATE,
                true,
                List.of(RecommendationPreference.PRIVACY)
        ));

        assertThat(response.topRecommendationId()).isNull();
        assertThat(response.recommendations()).isEmpty();
    }

    @Test
    void createReservationStoresReservationAndLookupReturnsIt() {
        LocalTime matchingTime = findTimeWithAvailableTables(
                PlanCode.INDOOR,
                4,
                Zone.INDOOR,
                List.of("T2")
        );

        ReservationResponse created = reservationService.createReservation(new ReservationRequest(
                "2026-03-21",
                matchingTime.toString(),
                4,
                "T2",
                "Marta V.",
                null,
                null,
                List.of(Preference.WINDOW)
        ));

        ReservationResponse loaded = reservationService.getReservation(created.reservationId());

        assertThat(created.status()).isEqualTo(ReservationStatus.CONFIRMED);
        assertThat(loaded.reservationId()).isEqualTo(created.reservationId());
        assertThat(loaded.tableId()).isEqualTo("T2");
        assertThat(loaded.partySize()).isEqualTo(4);
    }

    @Test
    void createdReservationBlocksSameTableForOverlappingTimes() {
        LocalTime matchingTime = findTimeWithAvailableTables(
                PlanCode.INDOOR,
                4,
                Zone.INDOOR,
                List.of("T2")
        );

        reservationService.createReservation(new ReservationRequest(
                "2026-03-21",
                matchingTime.toString(),
                4,
                "T2",
                "Marta V.",
                null,
                null,
                List.of()
        ));

        Map<String, AvailabilityStatus> immediateStatuses = availabilityService.calculateAvailability(
                PlanCode.INDOOR,
                LocalDate.of(2026, 3, 21),
                matchingTime,
                4,
                Zone.INDOOR,
                false
        );
        Map<String, AvailabilityStatus> overlappingStatuses = availabilityService.calculateAvailability(
                PlanCode.INDOOR,
                LocalDate.of(2026, 3, 21),
                matchingTime.plusMinutes(90),
                4,
                Zone.INDOOR,
                false
        );

        assertThat(immediateStatuses.get("T2")).isEqualTo(AvailabilityStatus.RESERVED);
        assertThat(overlappingStatuses.get("T2")).isEqualTo(AvailabilityStatus.RESERVED);
    }

    @Test
    void createReservationRejectsOverlappingBooking() {
        LocalTime matchingTime = findTimeWithAvailableTables(
                PlanCode.INDOOR,
                4,
                Zone.INDOOR,
                List.of("T2")
        );

        reservationService.createReservation(new ReservationRequest(
                "2026-03-21",
                matchingTime.toString(),
                4,
                "T2",
                "Marta V.",
                null,
                null,
                List.of()
        ));

        assertThatThrownBy(() -> reservationService.createReservation(new ReservationRequest(
                "2026-03-21",
                matchingTime.toString(),
                4,
                "T2",
                "Karl K.",
                null,
                null,
                List.of()
        )))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("409 CONFLICT");
    }

    @Test
    void createReservationRejectsInaccessibleTableWhenAccessibilityPreferenceIsPresent() {
        LocalTime matchingTime = findTimeWithAvailableTables(
                PlanCode.TERRACE,
                2,
                Zone.TERRACE,
                List.of("T8")
        );

        assertThatThrownBy(() -> reservationService.createReservation(new ReservationRequest(
                "2026-03-21",
                matchingTime.toString(),
                2,
                "T8",
                "Marta V.",
                null,
                null,
                List.of(Preference.ACCESSIBLE)
        )))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("400 BAD_REQUEST");
    }

    private LocalTime findTimeWithAvailableTables(
            PlanCode plan,
            int partySize,
            Zone zone,
            List<String> requiredTableIds
    ) {
        LocalDate date = LocalDate.of(2026, 3, 21);
        for (LocalTime candidateTime : candidateTimes()) {
            Map<String, AvailabilityStatus> statuses = availabilityService.calculateAvailability(
                    plan,
                    date,
                    candidateTime,
                    partySize,
                    zone,
                    false
            );
            boolean allAvailable = requiredTableIds.stream()
                    .allMatch(tableId -> statuses.get(tableId) == AvailabilityStatus.AVAILABLE);
            if (allAvailable) {
                return candidateTime;
            }
        }

        throw new AssertionError("Could not find a deterministic test timeslot for " + requiredTableIds);
    }

    private LocalTime findTimeWithStatuses(
            PlanCode plan,
            int partySize,
            Zone zone,
            boolean accessibleRequired,
            Map<String, AvailabilityStatus> expectedStatuses
    ) {
        LocalDate date = LocalDate.of(2026, 3, 21);

        for (LocalTime candidateTime : candidateTimes()) {
            Map<String, AvailabilityStatus> statuses = availabilityService.calculateAvailability(
                    plan,
                    date,
                    candidateTime,
                    partySize,
                    zone,
                    accessibleRequired
            );
            boolean allMatch = expectedStatuses.entrySet().stream()
                    .allMatch(entry -> statuses.get(entry.getKey()) == entry.getValue());
            if (allMatch) {
                return candidateTime;
            }
        }

        throw new AssertionError("Could not find a deterministic test timeslot for " + expectedStatuses);
    }

    private List<LocalTime> candidateTimes() {
        List<LocalTime> candidateTimes = new java.util.ArrayList<>();
        for (LocalTime candidateTime = LocalTime.of(11, 0);
             !candidateTime.isAfter(LocalTime.of(20, 0));
             candidateTime = candidateTime.plusMinutes(30)) {
            candidateTimes.add(candidateTime);
        }
        return List.copyOf(candidateTimes);
    }

    private int indexOf(RecommendationsResponse response, String tableId) {
        return response.recommendations().stream()
                .map(Recommendation::tableId)
                .toList()
                .indexOf(tableId);
    }
}
