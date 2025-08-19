package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.util.List;

public class ForecastRequestDto {
    
    @NotEmpty(message = "Holdings list cannot be empty")
    private List<HoldingInfoDto> holdings;
    
    @NotNull(message = "Time horizon is required")
    @Pattern(regexp = "1_month|3_months|1_year", message = "Time horizon must be 1_month, 3_months, or 1_year")
    private String timeHorizon;
    
    private Boolean includeScenarios = true;
    
    private Boolean includeMonteCarlo = true;
    
    @Min(value = 1000, message = "Monte Carlo simulations must be at least 1000")
    @Max(value = 10000, message = "Monte Carlo simulations cannot exceed 10000")
    private Integer monteCarloSimulations = 5000;

    public List<HoldingInfoDto> getHoldings() {
        return holdings;
    }

    public void setHoldings(List<HoldingInfoDto> holdings) {
        this.holdings = holdings;
    }

    public String getTimeHorizon() {
        return timeHorizon;
    }

    public void setTimeHorizon(String timeHorizon) {
        this.timeHorizon = timeHorizon;
    }

    public Boolean getIncludeScenarios() {
        return includeScenarios;
    }

    public void setIncludeScenarios(Boolean includeScenarios) {
        this.includeScenarios = includeScenarios;
    }

    public Boolean getIncludeMonteCarlo() {
        return includeMonteCarlo;
    }

    public void setIncludeMonteCarlo(Boolean includeMonteCarlo) {
        this.includeMonteCarlo = includeMonteCarlo;
    }

    public Integer getMonteCarloSimulations() {
        return monteCarloSimulations;
    }

    public void setMonteCarloSimulations(Integer monteCarloSimulations) {
        this.monteCarloSimulations = monteCarloSimulations;
    }
}