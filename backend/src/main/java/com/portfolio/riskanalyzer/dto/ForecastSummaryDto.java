package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

public class ForecastSummaryDto {
    
    @JsonProperty("time_horizon")
    private String timeHorizon;
    
    @JsonProperty("initial_value")
    private Double initialValue;
    
    @JsonProperty("final_projected_value")
    private Double finalProjectedValue;
    
    @JsonProperty("total_projected_gain")
    private Double totalProjectedGain;
    
    @JsonProperty("total_projected_gain_percentage")
    private Double totalProjectedGainPercentage;
    
    @JsonProperty("annualized_return")
    private Double annualizedReturn;
    
    @JsonProperty("forecast_generated_at")
    private LocalDateTime forecastGeneratedAt;
    
    @JsonProperty("best_case_final_value")
    private Double bestCaseFinalValue;
    
    @JsonProperty("worst_case_final_value")
    private Double worstCaseFinalValue;
    
    @JsonProperty("top_performers")
    private List<String> topPerformers;
    
    @JsonProperty("underperformers")
    private List<String> underperformers;
    
    @JsonProperty("monte_carlo_insights")
    private List<String> monteCarloInsights;

    public String getTimeHorizon() {
        return timeHorizon;
    }

    public void setTimeHorizon(String timeHorizon) {
        this.timeHorizon = timeHorizon;
    }

    public Double getInitialValue() {
        return initialValue;
    }

    public void setInitialValue(Double initialValue) {
        this.initialValue = initialValue;
    }

    public Double getFinalProjectedValue() {
        return finalProjectedValue;
    }

    public void setFinalProjectedValue(Double finalProjectedValue) {
        this.finalProjectedValue = finalProjectedValue;
    }

    public Double getTotalProjectedGain() {
        return totalProjectedGain;
    }

    public void setTotalProjectedGain(Double totalProjectedGain) {
        this.totalProjectedGain = totalProjectedGain;
    }

    public Double getTotalProjectedGainPercentage() {
        return totalProjectedGainPercentage;
    }

    public void setTotalProjectedGainPercentage(Double totalProjectedGainPercentage) {
        this.totalProjectedGainPercentage = totalProjectedGainPercentage;
    }

    public Double getAnnualizedReturn() {
        return annualizedReturn;
    }

    public void setAnnualizedReturn(Double annualizedReturn) {
        this.annualizedReturn = annualizedReturn;
    }

    public LocalDateTime getForecastGeneratedAt() {
        return forecastGeneratedAt;
    }

    public void setForecastGeneratedAt(LocalDateTime forecastGeneratedAt) {
        this.forecastGeneratedAt = forecastGeneratedAt;
    }

    public Double getBestCaseFinalValue() {
        return bestCaseFinalValue;
    }

    public void setBestCaseFinalValue(Double bestCaseFinalValue) {
        this.bestCaseFinalValue = bestCaseFinalValue;
    }

    public Double getWorstCaseFinalValue() {
        return worstCaseFinalValue;
    }

    public void setWorstCaseFinalValue(Double worstCaseFinalValue) {
        this.worstCaseFinalValue = worstCaseFinalValue;
    }

    public List<String> getTopPerformers() {
        return topPerformers;
    }

    public void setTopPerformers(List<String> topPerformers) {
        this.topPerformers = topPerformers;
    }

    public List<String> getUnderperformers() {
        return underperformers;
    }

    public void setUnderperformers(List<String> underperformers) {
        this.underperformers = underperformers;
    }

    public List<String> getMonteCarloInsights() {
        return monteCarloInsights;
    }

    public void setMonteCarloInsights(List<String> monteCarloInsights) {
        this.monteCarloInsights = monteCarloInsights;
    }
}