package com.portfolio.riskanalyzer.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class Holding {
    private String id;
    
    @NotBlank(message = "Ticker is required")
    private String ticker;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Double quantity;
    
    @JsonProperty("purchasePrice")
    @NotNull(message = "Purchase price is required")
    @Positive(message = "Purchase price must be positive")
    private Double purchasePrice;
    
    @JsonProperty("currentPrice")
    @NotNull(message = "Current price is required")
    @Positive(message = "Current price must be positive")
    private Double currentPrice;
    
    @NotNull(message = "Category is required")
    private AssetCategory category;
    
    @JsonProperty("marketValue")
    private Double marketValue;
    
    @JsonProperty("gainLoss")
    private Double gainLoss;
    
    @JsonProperty("gainLossPercentage")
    private Double gainLossPercentage;
    
    @JsonProperty("lastUpdated")
    private String lastUpdated;

    public Holding() {}

    // Calculate derived fields
    public void calculateDerivedFields() {
        if (quantity != null && currentPrice != null) {
            this.marketValue = quantity * currentPrice;
        }
        if (quantity != null && purchasePrice != null && currentPrice != null) {
            double totalPurchaseValue = quantity * purchasePrice;
            this.gainLoss = marketValue - totalPurchaseValue;
            this.gainLossPercentage = totalPurchaseValue > 0 ? (gainLoss / totalPurchaseValue) * 100 : 0;
        }
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(Double purchasePrice) { this.purchasePrice = purchasePrice; }

    public Double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(Double currentPrice) { this.currentPrice = currentPrice; }

    public AssetCategory getCategory() { return category; }
    public void setCategory(AssetCategory category) { this.category = category; }

    public Double getMarketValue() { return marketValue; }
    public void setMarketValue(Double marketValue) { this.marketValue = marketValue; }

    public Double getGainLoss() { return gainLoss; }
    public void setGainLoss(Double gainLoss) { this.gainLoss = gainLoss; }

    public Double getGainLossPercentage() { return gainLossPercentage; }
    public void setGainLossPercentage(Double gainLossPercentage) { this.gainLossPercentage = gainLossPercentage; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}