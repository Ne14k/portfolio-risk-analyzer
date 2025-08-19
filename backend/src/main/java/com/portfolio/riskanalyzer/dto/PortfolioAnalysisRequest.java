package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;

public class PortfolioAnalysisRequest {

    @NotNull
    private PortfolioAllocation allocation;

    @NotNull
    @Pattern(regexp = "low|medium|high", message = "Risk tolerance must be low, medium, or high")
    private String riskTolerance;

    @DecimalMin(value = "0.0", message = "Target return must be positive")
    @DecimalMax(value = "1.0", message = "Target return must be less than 100%")
    private Double targetReturn;

    private Integer timeHorizon;

    @Pattern(regexp = "sharpe|risk|return|income", message = "Invalid optimization goal")
    private String optimizationGoal = "sharpe";

    private ESGPreferences esgPreferences;
    private TaxPreferences taxPreferences;
    private SectorPreferences sectorPreferences;
    private Boolean useAiOptimization = true;

    public PortfolioAllocation getAllocation() {
        return allocation;
    }

    public void setAllocation(PortfolioAllocation allocation) {
        this.allocation = allocation;
    }

    public String getRiskTolerance() {
        return riskTolerance;
    }

    public void setRiskTolerance(String riskTolerance) {
        this.riskTolerance = riskTolerance;
    }

    public Double getTargetReturn() {
        return targetReturn;
    }

    public void setTargetReturn(Double targetReturn) {
        this.targetReturn = targetReturn;
    }

    public Integer getTimeHorizon() {
        return timeHorizon;
    }

    public void setTimeHorizon(Integer timeHorizon) {
        this.timeHorizon = timeHorizon;
    }

    public String getOptimizationGoal() {
        return optimizationGoal;
    }

    public void setOptimizationGoal(String optimizationGoal) {
        this.optimizationGoal = optimizationGoal;
    }

    public ESGPreferences getEsgPreferences() {
        return esgPreferences;
    }

    public void setEsgPreferences(ESGPreferences esgPreferences) {
        this.esgPreferences = esgPreferences;
    }

    public TaxPreferences getTaxPreferences() {
        return taxPreferences;
    }

    public void setTaxPreferences(TaxPreferences taxPreferences) {
        this.taxPreferences = taxPreferences;
    }

    public SectorPreferences getSectorPreferences() {
        return sectorPreferences;
    }

    public void setSectorPreferences(SectorPreferences sectorPreferences) {
        this.sectorPreferences = sectorPreferences;
    }

    public Boolean getUseAiOptimization() {
        return useAiOptimization;
    }

    public void setUseAiOptimization(Boolean useAiOptimization) {
        this.useAiOptimization = useAiOptimization;
    }
}