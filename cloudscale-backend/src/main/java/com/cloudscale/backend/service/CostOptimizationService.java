
package com.cloudscale.backend.service;

import org.springframework.stereotype.Service;

import com.cloudscale.backend.dto.CostComparison;
import com.cloudscale.backend.entity.Workload;

@Service
public class CostOptimizationService {

    public CostComparison compareCosts(Workload workload) {

        int cpu = workload.getCpuCores();
        int ram = workload.getRamGb();
        int users = workload.getExpectedUsers();

        // Illustrative local infrastructure cost model
        double localCost =
                1500 + (cpu * 300) + (ram * 150);

        // Illustrative AWS cost model
        double awsCost =
                1000 + (cpu * 500) + (ram * 250)
                + (users * 0.5);

        String recommendedOption;
        String explanation;

        if (localCost <= awsCost) {

            recommendedOption = "LOCAL";

            explanation =
                    "Local infrastructure has a lower estimated monthly cost.";

        } else {

            recommendedOption = "AWS";

            explanation =
                    "AWS has a lower estimated monthly cost.";
        }

        double savings = Math.abs(localCost - awsCost);

        return new CostComparison(
                localCost,
                awsCost,
                recommendedOption,
                savings,
                explanation
        );
    }
}

