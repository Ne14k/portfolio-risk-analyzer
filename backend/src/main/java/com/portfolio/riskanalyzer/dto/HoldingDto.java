package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public class HoldingDto {
    
    private String id;
    
    @NotBlank(message = "Ticker symbol is required")
    private String ticker;
    
    @NotBlank(message = "Asset name is required")
    private String name;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;
    
    @NotNull(message = "Purchase price is required")
    @Positive(message = "Purchase price must be positive")
    private Double purchasePrice;
    
    @NotNull(message = "Current price is required")
    @Positive(message = "Current price must be positive")
    private Double currentPrice;
    
    @NotNull(message = "Category is required")
    private String category;
    
    private Double marketValue;
    private Double gainLoss;
    private Double gainLossPercentage;
    private LocalDateTime lastUpdated;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public Double getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Double purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getMarketValue() {
        return marketValue;
    }

    public void setMarketValue(Double marketValue) {
        this.marketValue = marketValue;
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

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}