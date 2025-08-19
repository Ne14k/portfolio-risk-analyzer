package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SupabaseHolding {
    private String id;
    
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("portfolio_id")
    private String portfolioId;
    
    private String ticker;
    private String name;
    private String category;
    private double quantity;
    
    @JsonProperty("current_price")
    private double currentPrice;
    
    @JsonProperty("market_value")
    private double marketValue;
    
    @JsonProperty("purchase_price")
    private double purchasePrice;
    
    @JsonProperty("purchase_date")
    private String purchaseDate;
    
    @JsonProperty("total_cost")
    private double totalCost;
    
    @JsonProperty("unrealized_gain_loss")
    private double unrealizedGainLoss;
    
    @JsonProperty("unrealized_gain_loss_pct")
    private double unrealizedGainLossPct;
    
    private Double beta;
    private Double volatility;
    
    @JsonProperty("sharpe_ratio")
    private Double sharpeRatio;
    
    @JsonProperty("dividend_yield")
    private double dividendYield;
    
    @JsonProperty("portfolio_weight")
    private double portfolioWeight;
    
    private String exchange;
    private String sector;
    private String industry;
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("updated_at")
    private String updatedAt;
    
    @JsonProperty("last_price_update")
    private String lastPriceUpdate;

    public SupabaseHolding() {}

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getPortfolioId() { return portfolioId; }
    public void setPortfolioId(String portfolioId) { this.portfolioId = portfolioId; }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public double getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(double currentPrice) { this.currentPrice = currentPrice; }

    public double getMarketValue() { return marketValue; }
    public void setMarketValue(double marketValue) { this.marketValue = marketValue; }

    public double getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(double purchasePrice) { this.purchasePrice = purchasePrice; }

    public String getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(String purchaseDate) { this.purchaseDate = purchaseDate; }

    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }

    public double getUnrealizedGainLoss() { return unrealizedGainLoss; }
    public void setUnrealizedGainLoss(double unrealizedGainLoss) { this.unrealizedGainLoss = unrealizedGainLoss; }

    public double getUnrealizedGainLossPct() { return unrealizedGainLossPct; }
    public void setUnrealizedGainLossPct(double unrealizedGainLossPct) { this.unrealizedGainLossPct = unrealizedGainLossPct; }

    public Double getBeta() { return beta; }
    public void setBeta(Double beta) { this.beta = beta; }

    public Double getVolatility() { return volatility; }
    public void setVolatility(Double volatility) { this.volatility = volatility; }

    public Double getSharpeRatio() { return sharpeRatio; }
    public void setSharpeRatio(Double sharpeRatio) { this.sharpeRatio = sharpeRatio; }

    public double getDividendYield() { return dividendYield; }
    public void setDividendYield(double dividendYield) { this.dividendYield = dividendYield; }

    public double getPortfolioWeight() { return portfolioWeight; }
    public void setPortfolioWeight(double portfolioWeight) { this.portfolioWeight = portfolioWeight; }

    public String getExchange() { return exchange; }
    public void setExchange(String exchange) { this.exchange = exchange; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getLastPriceUpdate() { return lastPriceUpdate; }
    public void setLastPriceUpdate(String lastPriceUpdate) { this.lastPriceUpdate = lastPriceUpdate; }
}