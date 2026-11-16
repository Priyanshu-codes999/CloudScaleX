
package com.cloudscale.backend.service;

import org.springframework.stereotype.Service;

import com.cloudscale.backend.dto.PlacementRecommendation;
import com.cloudscale.backend.entity.Workload;

@Service
public class PlacementService {

    public PlacementRecommendation recommend(Workload workload) {

        int cpu = workload.getCpuCores();
        int ram = workload.getRamGb();
        int users = workload.getExpectedUsers();
        double budget = workload.getMonthlyBudget();

        if (cpu <= 2 && ram <= 4 && users <= 1000) {

            return new PlacementRecommendation(
                "LOCAL",
                "The workload has low resource requirements. Local infrastructure is suitable.",
                "Illustrative estimate: ₹0 additional cloud cost"
            );
        }

        if (budget < 1000) {

            return new PlacementRecommendation(
                "LOCAL",
                "The monthly budget is limited. Consider local infrastructure.",
                "Illustrative estimate: ₹0 additional cloud cost"
            );
        }

        return new PlacementRecommendation(
            "AWS",
            "The workload has higher resource requirements or user traffic. Cloud infrastructure offers better scalability.",
            "Cost requires AWS pricing analysis"
        );
    }
}
