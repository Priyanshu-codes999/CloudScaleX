
package com.cloudscale.backend.dto;

public class CostComparison {

    private double localMonthlyCost;
    private double awsMonthlyCost;
    private String recommendedOption;
    private double estimatedSavings;
    private String explanation;

    public CostComparison(
            double localMonthlyCost,
            double awsMonthlyCost,
            String recommendedOption,
            double estimatedSavings,
            String explanation) {

        this.localMonthlyCost = localMonthlyCost;
        this.awsMonthlyCost = awsMonthlyCost;
        this.recommendedOption = recommendedOption;
        this.estimatedSavings = estimatedSavings;
        this.explanation = explanation;
    }

    public double getLocalMonthlyCost() {
        return localMonthlyCost;
    }

    public double getAwsMonthlyCost() {
        return awsMonthlyCost;
    }

    public String getRecommendedOption() {
        return recommendedOption;
    }

    public double getEstimatedSavings() {
        return estimatedSavings;
    }

    public String getExplanation() {
        return explanation;
    }
}
