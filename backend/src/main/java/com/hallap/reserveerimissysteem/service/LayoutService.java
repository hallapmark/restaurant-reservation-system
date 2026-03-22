package com.hallap.reserveerimissysteem.service;

import com.hallap.reserveerimissysteem.dto.LayoutResponse;
import com.hallap.reserveerimissysteem.dto.PlanCode;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("unused")
public class LayoutService {
    private final LayoutSeedRepository layoutSeedRepository;

    public LayoutService(LayoutSeedRepository layoutSeedRepository) {
        this.layoutSeedRepository = layoutSeedRepository;
    }

    public LayoutResponse getLayout() {
        return layoutSeedRepository.getLayout();
    }

    public List<LayoutResponse.TableGeometry> getTablesForPlan(PlanCode plan) {
        return layoutSeedRepository.getTablesForPlan(plan);
    }

    public List<LayoutResponse.LayoutFeature> getFeaturesForPlan(PlanCode plan) {
        return layoutSeedRepository.getFeaturesForPlan(plan);
    }

    public Optional<LayoutResponse.TableGeometry> getTableById(String tableId) {
        return layoutSeedRepository.getLayout().tables().stream()
                .filter(table -> table.tableId().equals(tableId))
                .findFirst();
    }
}
