package com.cloudscale.backend.dto;

public class PlacementRecommendation {

    private String recommendedPlatform;
    private String reason;
    private String estimatedMonthlyCost;

    public PlacementRecommendation(
            String recommendedPlatform,
            String reason,
            String estimatedMonthlyCost) {
        this.recommendedPlatform = recommendedPlatform;
        this.reason = reason;
        this.estimatedMonthlyCost = estimatedMonthlyCost;
    }

    public String getRecommendedPlatform() {
        return recommendedPlatform;
    }

    public String getReason() {
        return reason;
    }

    public String getEstimatedMonthlyCost() {
        return estimatedMonthlyCost;
    }
}