package com.portfolio.riskanalyzer.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class Portfolio {
    private String id;
    
    @NotBlank(message = "Portfolio name is required")
    private String name;
    
    @NotNull(message = "Holdings list is required")
    private List<Holding> holdings;
    
    @JsonProperty("totalValue")
    private Double totalValue;
    
    @JsonProperty("totalGainLoss")
    private Double totalGainLoss;
    
    @JsonProperty("totalGainLossPercentage")
    private Double totalGainLossPercentage;
    
    @JsonProperty("assetAllocation")
    private AssetAllocation assetAllocation;
    
    @JsonProperty("lastUpdated")
    private String lastUpdated;

    public Portfolio() {}

    // Calculate portfolio metrics
    public void calculateMetrics() {
        if (holdings != null) {
            this.totalValue = holdings.stream()
                .mapToDouble(h -> h.getMarketValue() != null ? h.getMarketValue() : 0.0)
                .sum();
            
            this.totalGainLoss = holdings.stream()
                .mapToDouble(h -> h.getGainLoss() != null ? h.getGainLoss() : 0.0)
                .sum();
            
            double totalPurchaseValue = holdings.stream()
                .mapToDouble(h -> h.getQuantity() * h.getPurchasePrice())
                .sum();
            
            this.totalGainLossPercentage = totalPurchaseValue > 0 ? 
                (totalGainLoss / totalPurchaseValue) * 100 : 0;
                
            calculateAssetAllocation();
        }
    }
    
    private void calculateAssetAllocation() {
        if (holdings == null || totalValue == null || totalValue == 0) {
            this.assetAllocation = new AssetAllocation();
            return;
        }
        
        double stocks = 0, etfs = 0, crypto = 0, bonds = 0, realEstate = 0, cash = 0, commodities = 0;
        
        for (Holding holding : holdings) {
            double value = holding.getMarketValue() != null ? holding.getMarketValue() : 0.0;
            double percentage = (value / totalValue) * 100;
            
            switch (holding.getCategory()) {
                case STOCKS -> stocks += percentage;
                case ETFS -> etfs += percentage;
                case CRYPTO -> crypto += percentage;
                case BONDS -> bonds += percentage;
                case REAL_ESTATE -> realEstate += percentage;
                case CASH -> cash += percentage;
                case COMMODITIES -> commodities += percentage;
            }
        }
        
        this.assetAllocation = new AssetAllocation(stocks, etfs, crypto, bonds, realEstate, cash, commodities);
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Holding> getHoldings() { return holdings; }
    public void setHoldings(List<Holding> holdings) { this.holdings = holdings; }

    public Double getTotalValue() { return totalValue; }
    public void setTotalValue(Double totalValue) { this.totalValue = totalValue; }

    public Double getTotalGainLoss() { return totalGainLoss; }
    public void setTotalGainLoss(Double totalGainLoss) { this.totalGainLoss = totalGainLoss; }

    public Double getTotalGainLossPercentage() { return totalGainLossPercentage; }
    public void setTotalGainLossPercentage(Double totalGainLossPercentage) { this.totalGainLossPercentage = totalGainLossPercentage; }

    public AssetAllocation getAssetAllocation() { return assetAllocation; }
    public void setAssetAllocation(AssetAllocation assetAllocation) { this.assetAllocation = assetAllocation; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}