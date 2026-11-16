
package com.cloudscale.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudscale.backend.dto.PlacementRecommendation;
import com.cloudscale.backend.entity.Workload;
import com.cloudscale.backend.service.PlacementService;
import com.cloudscale.backend.service.WorkloadService;

@RestController
@RequestMapping("/api/v1/placement")
public class PlacementController {

    private final PlacementService placementService;
    private final WorkloadService workloadService;

    public PlacementController(
            PlacementService placementService,
            WorkloadService workloadService) {

        this.placementService = placementService;
        this.workloadService = workloadService;
    }

    @GetMapping("/{id}")
    public PlacementRecommendation recommendPlacement(
            @PathVariable Long id) {

        Workload workload =
                workloadService.getWorkloadById(id);

        return placementService.recommend(workload);
    }
}
