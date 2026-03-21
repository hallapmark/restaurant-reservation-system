package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.AvailabilityRequest;
import com.hallap.reserveerimissysteem.dto.AvailabilityResponse;
import com.hallap.reserveerimissysteem.dto.AvailabilityStatus;
import com.hallap.reserveerimissysteem.dto.LayoutResponse;
import com.hallap.reserveerimissysteem.dto.PlanCode;
import com.hallap.reserveerimissysteem.dto.Zone;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AvailabilityService {
    private final LayoutService layoutService;
    private final OccupancyService occupancyService;

    public AvailabilityService(LayoutService layoutService, OccupancyService occupancyService) {
        this.layoutService = layoutService;
        this.occupancyService = occupancyService;
    }

    public AvailabilityResponse getAvailability(AvailabilityRequest request) {
        return new AvailabilityResponse(
                calculateAvailability(
                        request.plan(),
                        LocalDate.parse(request.date()),
                        LocalTime.parse(request.time()),
                        request.partySize(),
                        request.zone()
                ),
                Instant.now()
        );
    }

    public Map<String, AvailabilityStatus> calculateAvailability(
            PlanCode plan,
            LocalDate date,
            LocalTime time,
            int partySize,
            Zone zone
    ) {
        List<LayoutResponse.TableGeometry> tables = layoutService.getTablesForPlan(plan);
        Set<String> reservedTableIds = occupancyService.getReservedTableIds(plan, date, time, tables);
        Map<String, AvailabilityStatus> statuses = new LinkedHashMap<>();

        for (LayoutResponse.TableGeometry table : tables) {
            AvailabilityStatus status;
            if (reservedTableIds.contains(table.tableId())) {
                status = AvailabilityStatus.RESERVED;
            } else if (!isSuitableForRequest(table, partySize, zone)) {
                status = AvailabilityStatus.UNAVAILABLE;
            } else {
                status = AvailabilityStatus.AVAILABLE;
            }
            statuses.put(table.tableId(), status);
        }

        return statuses;
    }

    private boolean isSuitableForRequest(LayoutResponse.TableGeometry table, int partySize, Zone zone) {
        if (table.capacity() < partySize) {
            return false;
        }

        return zone == null || table.zone() == zone;
    }
}
