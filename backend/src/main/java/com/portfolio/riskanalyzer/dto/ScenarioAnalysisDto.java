package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class ScenarioAnalysisDto {
    
    @JsonProperty("best_case")
    private List<PortfolioForecastPointDto> bestCase;
    
    @JsonProperty("worst_case")
    private List<PortfolioForecastPointDto> worstCase;
    
    @JsonProperty("confidence_level")
    private Double confidenceLevel;

    public List<PortfolioForecastPointDto> getBestCase() {
        return bestCase;
    }

    public void setBestCase(List<PortfolioForecastPointDto> bestCase) {
        this.bestCase = bestCase;
    }

    public List<PortfolioForecastPointDto> getWorstCase() {
        return worstCase;
    }

    public void setWorstCase(List<PortfolioForecastPointDto> worstCase) {
        this.worstCase = worstCase;
    }

    public Double getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(Double confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }
}