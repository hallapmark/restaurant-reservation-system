package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.Preference;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RuntimeReservationStore {
    private final Map<String, StoredReservation> reservationsById = new ConcurrentHashMap<>();

    public StoredReservation save(StoredReservation reservation) {
        reservationsById.put(reservation.reservationId(), reservation);
        return reservation;
    }

    public Optional<StoredReservation> findById(String reservationId) {
        return Optional.ofNullable(reservationsById.get(reservationId));
    }

    public Set<String> getReservedTableIds(
            LocalDate date,
            LocalTime time,
            Collection<String> tableIds
    ) {
        Set<String> allowedTableIds = Set.copyOf(tableIds);
        Set<String> reservedTableIds = new LinkedHashSet<>();

        for (StoredReservation reservation : reservationsById.values()) {
            if (!allowedTableIds.contains(reservation.tableId())) {
                continue;
            }
            if (reservation.contains(date, time)) {
                reservedTableIds.add(reservation.tableId());
            }
        }

        return reservedTableIds;
    }

    public void clear() {
        reservationsById.clear();
    }

    public record StoredReservation(
            String reservationId,
            String tableId,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            int partySize,
            String customerName,
            String customerPhone,
            String customerEmail,
            List<Preference> preferences,
            Instant createdAt
    ) {
        public boolean contains(LocalDate date, LocalTime time) {
            LocalDateTime candidate = LocalDateTime.of(date, time);
            return !candidate.isBefore(startDateTime) && candidate.isBefore(endDateTime);
        }
    }
}
