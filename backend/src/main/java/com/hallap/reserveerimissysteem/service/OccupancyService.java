package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.LayoutResponse;
import com.hallap.reserveerimissysteem.dto.PlanCode;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OccupancyService {
    private static final String SALT = "cgi-2026-demo-v1";
    private static final LocalTime OPENING_TIME = LocalTime.of(11, 0);
    private static final LocalTime LAST_BOOKING_START = LocalTime.of(20, 0);
    private static final int SLOT_STEP_MINUTES = 30;
    private static final int EXPECTED_BOOKING_DURATION_MINUTES = 120;
    private final RuntimeReservationStore runtimeReservationStore;

    public OccupancyService(RuntimeReservationStore runtimeReservationStore) {
        this.runtimeReservationStore = runtimeReservationStore;
    }

    public Set<String> getReservedTableIds(
            PlanCode plan,
            LocalDate date,
            LocalTime time,
            List<LayoutResponse.TableGeometry> tables
    ) {
        Set<String> reservedTableIds = new LinkedHashSet<>();
        List<GeneratedReservation> generatedReservations = generateReservations(plan, date, tables);

        for (GeneratedReservation generatedReservation : generatedReservations) {
            if (generatedReservation.contains(time)) {
                reservedTableIds.add(generatedReservation.tableId());
            }
        }

        reservedTableIds.addAll(runtimeReservationStore.getReservedTableIds(
                date,
                time,
                tables.stream()
                        .map(LayoutResponse.TableGeometry::tableId)
                        .collect(Collectors.toSet())
        ));

        return reservedTableIds;
    }

    public int getExpectedBookingDurationMinutes() {
        return EXPECTED_BOOKING_DURATION_MINUTES;
    }

    private List<GeneratedReservation> generateReservations(
            PlanCode plan,
            LocalDate date,
            List<LayoutResponse.TableGeometry> tables
    ) {
        List<GeneratedReservation> generatedReservations = new ArrayList<>();

        for (LayoutResponse.TableGeometry table : tables) {
            LocalTime nextEligibleStart = OPENING_TIME;

            for (LocalTime candidateStart = OPENING_TIME;
                 !candidateStart.isAfter(LAST_BOOKING_START);
                 candidateStart = candidateStart.plusMinutes(SLOT_STEP_MINUTES)) {
                if (candidateStart.isBefore(nextEligibleStart)) {
                    continue;
                }

                int threshold = getReservationThreshold(candidateStart);
                if (shouldStartReservation(plan, date, candidateStart, table.tableId(), threshold)) {
                    LocalTime endTime = candidateStart.plusMinutes(EXPECTED_BOOKING_DURATION_MINUTES);
                    generatedReservations.add(new GeneratedReservation(table.tableId(), candidateStart, endTime));
                    nextEligibleStart = endTime;
                }
            }
        }

        return generatedReservations;
    }

    private boolean shouldStartReservation(
            PlanCode plan,
            LocalDate date,
            LocalTime startTime,
            String tableId,
            int threshold
    ) {
        String key = "%s|%s|%s|%s|%s".formatted(date, startTime, plan, tableId, SALT);
        int normalized = Math.floorMod(key.hashCode(), 100);
        return normalized < threshold;
    }

    private int getReservationThreshold(LocalTime time) {
        int hour = time.getHour();
        if (hour >= 12 && hour <= 14) {
            return 20;
        }
        if (hour >= 18 && hour <= 21) {
            return 35;
        }
        return 10;
    }

    private record GeneratedReservation(
            String tableId,
            LocalTime startTime,
            LocalTime endTime
    ) {
        private boolean contains(LocalTime time) {
            return !time.isBefore(startTime) && time.isBefore(endTime);
        }
    }
}
