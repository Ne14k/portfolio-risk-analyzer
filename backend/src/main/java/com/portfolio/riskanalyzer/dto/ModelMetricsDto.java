package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ModelMetricsDto {
    
    @JsonProperty("r_squared")
    private Double rSquared;
    
    private Double mse;
    
    private Double mae;
    
    @JsonProperty("training_period_days")
    private Integer trainingPeriodDays;

    public Double getRSquared() {
        return rSquared;
    }

    public void setRSquared(Double rSquared) {
        this.rSquared = rSquared;
    }

    public Double getMse() {
        return mse;
    }

    public void setMse(Double mse) {
        this.mse = mse;
    }

    public Double getMae() {
        return mae;
    }

    public void setMae(Double mae) {
        this.mae = mae;
    }

    public Integer getTrainingPeriodDays() {
        return trainingPeriodDays;
    }

    public void setTrainingPeriodDays(Integer trainingPeriodDays) {
        this.trainingPeriodDays = trainingPeriodDays;
    }
}