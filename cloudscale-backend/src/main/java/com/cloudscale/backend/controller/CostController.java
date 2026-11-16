
package com.cloudscale.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cloudscale.backend.dto.CostComparison;
import com.cloudscale.backend.entity.Workload;
import com.cloudscale.backend.service.CostOptimizationService;
import com.cloudscale.backend.service.WorkloadService;

@RestController
@RequestMapping("/api/v1/cost")
public class CostController {

    private final CostOptimizationService costService;
    private final WorkloadService workloadService;

    public CostController(
            CostOptimizationService costService,
            WorkloadService workloadService) {

        this.costService = costService;
        this.workloadService = workloadService;
    }

    @GetMapping("/{id}")
    public CostComparison compareCost(
            @PathVariable Long id) {

        Workload workload =
                workloadService.getWorkloadById(id);

        return costService.compareCosts(workload);
    }
}
