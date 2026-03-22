package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.ReservationRequest;
import com.hallap.reserveerimissysteem.dto.ReservationResponse;
import com.hallap.reserveerimissysteem.dto.ReservationStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class ReservationService {
    private final LayoutService layoutService;
    private final OccupancyService occupancyService;
    private final RuntimeReservationStore runtimeReservationStore;

    public ReservationService(
            LayoutService layoutService,
            OccupancyService occupancyService,
            RuntimeReservationStore runtimeReservationStore
    ) {
        this.layoutService = layoutService;
        this.occupancyService = occupancyService;
        this.runtimeReservationStore = runtimeReservationStore;
    }

    public ReservationResponse createReservation(ReservationRequest reservationRequest) {
        LocalDate date = LocalDate.parse(reservationRequest.date());
        LocalTime time = LocalTime.parse(reservationRequest.time());
        List<com.hallap.reserveerimissysteem.dto.Preference> preferences =
                reservationRequest.preferences() == null ? List.of() : List.copyOf(reservationRequest.preferences());

        var table = layoutService.getTableById(reservationRequest.tableId())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Valitud lauda ei leitud."));

        if (table.capacity() < reservationRequest.partySize()) {
            throw new ResponseStatusException(BAD_REQUEST, "Valitud laud ei mahuta seda seltskonda.");
        }

        boolean accessibleRequired = preferences.contains(com.hallap.reserveerimissysteem.dto.Preference.ACCESSIBLE);
        if (accessibleRequired && !table.accessible()) {
            throw new ResponseStatusException(BAD_REQUEST, "Valitud laud ei ole ligipääsetav.");
        }

        Set<String> reservedTableIds = occupancyService.getReservedTableIds(
                table.plan(),
                date,
                time,
                layoutService.getTablesForPlan(table.plan())
        );
        if (reservedTableIds.contains(table.tableId())) {
            throw new ResponseStatusException(CONFLICT, "See laud on valitud ajaks juba broneeritud.");
        }

        Instant createdAt = Instant.now();
        RuntimeReservationStore.StoredReservation storedReservation = runtimeReservationStore.save(
                new RuntimeReservationStore.StoredReservation(
                        generateReservationId(),
                        table.tableId(),
                        LocalDateTime.of(date, time),
                        LocalDateTime.of(date, time).plusMinutes(occupancyService.getExpectedBookingDurationMinutes()),
                        reservationRequest.partySize(),
                        reservationRequest.customerName(),
                        reservationRequest.customerPhone(),
                        reservationRequest.customerEmail(),
                        preferences,
                        createdAt
                )
        );

        return toResponse(storedReservation, "Broneering kinnitatud.");
    }

    public ReservationResponse getReservation(String id) {
        RuntimeReservationStore.StoredReservation reservation = runtimeReservationStore.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Broneeringut ei leitud."));

        return toResponse(reservation, "Broneering leitud.");
    }

    private String generateReservationId() {
        return "rsv_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private ReservationResponse toResponse(
            RuntimeReservationStore.StoredReservation reservation,
            String message
    ) {
        return new ReservationResponse(
                reservation.reservationId(),
                reservation.tableId(),
                reservation.startDateTime().toLocalDate().toString(),
                reservation.startDateTime().toLocalTime().toString(),
                reservation.partySize(),
                ReservationStatus.CONFIRMED,
                reservation.createdAt(),
                message
        );
    }
}
