package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class PortfolioDto {
    
    private String id;
    
    @NotBlank(message = "Portfolio name is required")
    private String name;
    
    @NotNull(message = "Holdings list is required")
    private List<HoldingDto> holdings;
    
    private Double totalValue;
    private Double totalGainLoss;
    private Double totalGainLossPercentage;
    private AssetAllocationDto assetAllocation;
    private LocalDateTime lastUpdated;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<HoldingDto> getHoldings() {
        return holdings;
    }

    public void setHoldings(List<HoldingDto> holdings) {
        this.holdings = holdings;
    }

    public Double getTotalValue() {
        return totalValue;
    }

    public void setTotalValue(Double totalValue) {
        this.totalValue = totalValue;
    }

    public Double getTotalGainLoss() {
        return totalGainLoss;
    }

    public void setTotalGainLoss(Double totalGainLoss) {
        this.totalGainLoss = totalGainLoss;
    }

    public Double getTotalGainLossPercentage() {
        return totalGainLossPercentage;
    }

    public void setTotalGainLossPercentage(Double totalGainLossPercentage) {
        this.totalGainLossPercentage = totalGainLossPercentage;
    }

    public AssetAllocationDto getAssetAllocation() {
        return assetAllocation;
    }

    public void setAssetAllocation(AssetAllocationDto assetAllocation) {
        this.assetAllocation = assetAllocation;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}