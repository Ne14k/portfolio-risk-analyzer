package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SupabasePortfolio {
    private String id;
    
    @JsonProperty("user_id")
    private String userId;
    
    private String name;
    private String description;
    
    @JsonProperty("risk_level")
    private String riskLevel;
    
    @JsonProperty("total_value")
    private double totalValue;
    
    @JsonProperty("target_allocation")
    private Object targetAllocation;
    
    @JsonProperty("rebalance_frequency")
    private int rebalanceFrequency;
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("updated_at")
    private String updatedAt;

    public SupabasePortfolio() {}

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public double getTotalValue() { return totalValue; }
    public void setTotalValue(double totalValue) { this.totalValue = totalValue; }

    public Object getTargetAllocation() { return targetAllocation; }
    public void setTargetAllocation(Object targetAllocation) { this.targetAllocation = targetAllocation; }

    public int getRebalanceFrequency() { return rebalanceFrequency; }
    public void setRebalanceFrequency(int rebalanceFrequency) { this.rebalanceFrequency = rebalanceFrequency; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}