package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.LayoutResponse;
import com.hallap.reserveerimissysteem.dto.PlanCode;
import com.hallap.reserveerimissysteem.dto.Zone;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Component
public class LayoutSeedRepository {
    private final LayoutResponse layout;

    public LayoutSeedRepository(ObjectMapper objectMapper) {
        this.layout = loadLayout(objectMapper);
    }

    public LayoutResponse getLayout() {
        return layout;
    }

    public List<LayoutResponse.TableGeometry> getTablesForPlan(PlanCode plan) {
        return layout.tables().stream()
                .filter(table -> table.plan() == plan)
                .toList();
    }

    public List<LayoutResponse.LayoutFeature> getFeaturesForPlan(PlanCode plan) {
        return layout.features().stream()
                .filter(feature -> feature.plan() == plan)
                .toList();
    }

    private LayoutResponse loadLayout(ObjectMapper objectMapper) {
        try (InputStream inputStream = new ClassPathResource("seed/layout.json").getInputStream()) {
            LayoutResponse loadedLayout = objectMapper.readValue(inputStream, LayoutResponse.class);
            validateLayout(loadedLayout);
            return loadedLayout;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to load layout seed data.", exception);
        }
    }

    private void validateLayout(LayoutResponse loadedLayout) {
        Set<PlanCode> planCodes = loadedLayout.plans().stream()
                .map(LayoutResponse.PlanSummary::code)
                .collect(java.util.stream.Collectors.toCollection(() -> EnumSet.noneOf(PlanCode.class)));
        Set<Zone> zoneCodes = loadedLayout.zones().stream()
                .map(LayoutResponse.ZoneSummary::code)
                .collect(java.util.stream.Collectors.toCollection(() -> EnumSet.noneOf(Zone.class)));

        for (LayoutResponse.TableGeometry table : loadedLayout.tables()) {
            if (!planCodes.contains(table.plan())) {
                throw new IllegalStateException("Table %s references unknown plan %s."
                        .formatted(table.tableId(), table.plan()));
            }
            if (!zoneCodes.contains(table.zone())) {
                throw new IllegalStateException("Table %s references unknown zone %s."
                        .formatted(table.tableId(), table.zone()));
            }
            if (table.zone() == Zone.PRIVATE && table.plan() != PlanCode.INDOOR) {
                throw new IllegalStateException("PRIVATE table %s must belong to INDOOR plan."
                        .formatted(table.tableId()));
            }
        }

        for (LayoutResponse.LayoutFeature feature : loadedLayout.features()) {
            if (!planCodes.contains(feature.plan())) {
                throw new IllegalStateException("Feature %s references unknown plan %s."
                        .formatted(feature.featureId(), feature.plan()));
            }
        }
    }
}
