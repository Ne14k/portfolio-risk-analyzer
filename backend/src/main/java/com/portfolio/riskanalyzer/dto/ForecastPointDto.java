package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;

public class ForecastPointDto {
    
    private LocalDate date;
    
    @JsonProperty("predicted_price")
    private Double predictedPrice;
    
    @JsonProperty("portfolio_value_contribution")
    private Double portfolioValueContribution;

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getPredictedPrice() {
        return predictedPrice;
    }

    public void setPredictedPrice(Double predictedPrice) {
        this.predictedPrice = predictedPrice;
    }

    public Double getPortfolioValueContribution() {
        return portfolioValueContribution;
    }

    public void setPortfolioValueContribution(Double portfolioValueContribution) {
        this.portfolioValueContribution = portfolioValueContribution;
    }
}