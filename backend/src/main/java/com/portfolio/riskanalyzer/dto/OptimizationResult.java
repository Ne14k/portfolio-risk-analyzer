package com.portfolio.riskanalyzer.dto;

import java.util.List;

public class OptimizationResult {
    private PortfolioAllocation optimizedAllocation;
    private RiskMetrics currentMetrics;
    private RiskMetrics optimizedMetrics;
    private List<String> recommendations;
    private List<String> explanations;

    public OptimizationResult() {}

    public PortfolioAllocation getOptimizedAllocation() {
        return optimizedAllocation;
    }

    public void setOptimizedAllocation(PortfolioAllocation optimizedAllocation) {
        this.optimizedAllocation = optimizedAllocation;
    }

    public RiskMetrics getCurrentMetrics() {
        return currentMetrics;
    }

    public void setCurrentMetrics(RiskMetrics currentMetrics) {
        this.currentMetrics = currentMetrics;
    }

    public RiskMetrics getOptimizedMetrics() {
        return optimizedMetrics;
    }

    public void setOptimizedMetrics(RiskMetrics optimizedMetrics) {
        this.optimizedMetrics = optimizedMetrics;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }

    public List<String> getExplanations() {
        return explanations;
    }

    public void setExplanations(List<String> explanations) {
        this.explanations = explanations;
    }
}