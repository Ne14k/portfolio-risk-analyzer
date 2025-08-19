package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

public class SectorPreferences {
    
    @DecimalMin(value = "0.0", message = "Technology allocation must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Technology allocation must be between 0 and 1")
    private Double technology;
    
    @DecimalMin(value = "0.0", message = "Healthcare allocation must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Healthcare allocation must be between 0 and 1")
    private Double healthcare;
    
    @DecimalMin(value = "0.0", message = "Financials allocation must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Financials allocation must be between 0 and 1")
    private Double financials;
    
    @DecimalMin(value = "0.0", message = "Energy allocation must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Energy allocation must be between 0 and 1")
    private Double energy;
    
    @DecimalMin(value = "0.0", message = "Max sector concentration must be between 0 and 1")
    @DecimalMax(value = "1.0", message = "Max sector concentration must be between 0 and 1")
    private Double maxSectorConcentration = 0.3;

    public Double getTechnology() {
        return technology;
    }

    public void setTechnology(Double technology) {
        this.technology = technology;
    }

    public Double getHealthcare() {
        return healthcare;
    }

    public void setHealthcare(Double healthcare) {
        this.healthcare = healthcare;
    }

    public Double getFinancials() {
        return financials;
    }

    public void setFinancials(Double financials) {
        this.financials = financials;
    }

    public Double getEnergy() {
        return energy;
    }

    public void setEnergy(Double energy) {
        this.energy = energy;
    }

    public Double getMaxSectorConcentration() {
        return maxSectorConcentration;
    }

    public void setMaxSectorConcentration(Double maxSectorConcentration) {
        this.maxSectorConcentration = maxSectorConcentration;
    }
}