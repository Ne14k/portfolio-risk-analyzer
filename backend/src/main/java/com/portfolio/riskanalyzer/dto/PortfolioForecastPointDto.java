package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class PortfolioForecastPointDto {
    
    private LocalDate date;
    
    @JsonProperty("total_value")
    private Double totalValue;
    
    @JsonProperty("gain_loss")
    private Double gainLoss;
    
    @JsonProperty("gain_loss_percentage")
    private Double gainLossPercentage;

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(Double totalValue) {
        this.totalValue = totalValue;
    }

    public Double getGainLoss() {
        return gainLoss;
    }

    public void setGainLoss(Double gainLoss) {
        this.gainLoss = gainLoss;
    }

    public Double getGainLossPercentage() {
        return gainLossPercentage;
    }

    public void setGainLossPercentage(Double gainLossPercentage) {
        this.gainLossPercentage = gainLossPercentage;
    }
}