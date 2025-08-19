package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

public class PortfolioForecastDto {
    
    @JsonProperty("current_total_value")
    private Double currentTotalValue;
    
    @JsonProperty("forecast_data")
    private List<PortfolioForecastPointDto> forecastData;
    
    @JsonProperty("individual_assets")
    private List<AssetForecastDto> individualAssets;
    
    private ScenarioAnalysisDto scenarios;
    
    @JsonProperty("monte_carlo_results")
    private MonteCarloResultsDto monteCarloResults;
    
    private ForecastSummaryDto summary;

    public Double getCurrentTotalValue() {
        return currentTotalValue;
    }

    public void setCurrentTotalValue(Double currentTotalValue) {
        this.currentTotalValue = currentTotalValue;
    }

    public List<PortfolioForecastPointDto> getForecastData() {
        return forecastData;
    }

    public void setForecastData(List<PortfolioForecastPointDto> forecastData) {
        this.forecastData = forecastData;
    }

    public List<AssetForecastDto> getIndividualAssets() {
        return individualAssets;
    }

    public void setIndividualAssets(List<AssetForecastDto> individualAssets) {
        this.individualAssets = individualAssets;
    }

    public ScenarioAnalysisDto getScenarios() {
        return scenarios;
    }

    public void setScenarios(ScenarioAnalysisDto scenarios) {
        this.scenarios = scenarios;
    }

    public MonteCarloResultsDto getMonteCarloResults() {
        return monteCarloResults;
    }

    public void setMonteCarloResults(MonteCarloResultsDto monteCarloResults) {
        this.monteCarloResults = monteCarloResults;
    }

    public ForecastSummaryDto getSummary() {
        return summary;
    }

    public void setSummary(ForecastSummaryDto summary) {
        this.summary = summary;
    }
}