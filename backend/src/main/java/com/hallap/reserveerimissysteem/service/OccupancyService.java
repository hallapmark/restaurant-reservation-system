package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.LayoutResponse;
import com.hallap.reserveerimissysteem.dto.PlanCode;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class OccupancyService {
    private static final String SALT = "cgi-2026-demo-v1";

    public Set<String> getReservedTableIds(
            PlanCode plan,
            LocalDate date,
            LocalTime time,
            List<LayoutResponse.TableGeometry> tables
    ) {
        int threshold = getReservationThreshold(time);
        Set<String> reservedTableIds = new LinkedHashSet<>();

        for (LayoutResponse.TableGeometry table : tables) {
            if (isReserved(plan, date, time, table.tableId(), threshold)) {
                reservedTableIds.add(table.tableId());
            }
        }

        return reservedTableIds;
    }

    private boolean isReserved(
            PlanCode plan,
            LocalDate date,
            LocalTime time,
            String tableId,
            int threshold
    ) {
        String key = "%s|%s|%s|%s|%s".formatted(date, time, plan, tableId, SALT);
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
}
