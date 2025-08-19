package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class HoldingInfoDto {
    
    @NotBlank(message = "Ticker symbol is required")
    private String ticker;
    
    @NotBlank(message = "Asset name is required")
    private String name;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;
    
    @NotNull(message = "Current price is required")
    @Positive(message = "Current price must be positive")
    private Double currentPrice;
    
    @NotNull(message = "Market value is required")
    @Positive(message = "Market value must be positive")
    private Double marketValue;

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public Double getMarketValue() {
        return marketValue;
    }

    public void setMarketValue(Double marketValue) {
        this.marketValue = marketValue;
    }
}