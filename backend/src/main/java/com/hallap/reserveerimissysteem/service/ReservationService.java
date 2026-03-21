package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.ReservationRequest;
import com.hallap.reserveerimissysteem.dto.ReservationResponse;
import com.hallap.reserveerimissysteem.dto.ReservationStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ReservationService {
    public ReservationResponse createReservation(ReservationRequest reservationRequest) {
        return new ReservationResponse(
                "rsv_demo_1",
                reservationRequest.tableId(),
                reservationRequest.date(),
                reservationRequest.time(),
                reservationRequest.partySize(),
                ReservationStatus.CONFIRMED,
                Instant.now(),
                "Broneeringu loomine lisandub järgmises etapis."
        );
    }

    public ReservationResponse getReservation(String id) {
        return new ReservationResponse(
                id,
                "T1",
                "2026-03-21",
                "19:30",
                4,
                ReservationStatus.CONFIRMED,
                Instant.now(),
                "Broneeringu detailvaade lisandub järgmises etapis."
        );
    }
}
