package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

public class ESGPreferences {
    
    @DecimalMin(value = "0.0", message = "Environmental score must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Environmental score must be between 0 and 1")
    private Double environmental = 0.5;
    
    @DecimalMin(value = "0.0", message = "Social score must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Social score must be between 0 and 1")
    private Double social = 0.5;
    
    @DecimalMin(value = "0.0", message = "Governance score must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Governance score must be between 0 and 1")
    private Double governance = 0.5;
    
    @DecimalMin(value = "0.0", message = "Overall importance must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Overall importance must be between 0 and 1")
    private Double overallImportance = 0.5;

    public Double getEnvironmental() {
        return environmental;
    }

    public void setEnvironmental(Double environmental) {
        this.environmental = environmental;
    }

    public Double getSocial() {
        return social;
    }

    public void setSocial(Double social) {
        this.social = social;
    }

    public Double getGovernance() {
        return governance;
    }

    public void setGovernance(Double governance) {
        this.governance = governance;
    }

    public Double getOverallImportance() {
        return overallImportance;
    }

    public void setOverallImportance(Double overallImportance) {
        this.overallImportance = overallImportance;
    }
}