package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class MonteCarloSummaryDto {
    
    @JsonProperty("mean_return")
    private Double meanReturn;
    
    private Double volatility;
    
    private Double skewness;
    
    private Double kurtosis;
    
    @JsonProperty("sharpe_ratio")
    private Double sharpeRatio;
    
    @JsonProperty("downside_deviation")
    private Double downsideDeviation;
    
    @JsonProperty("maximum_drawdown")
    private Double maximumDrawdown;
    
    @JsonProperty("confidence_intervals")
    private Map<String, Map<String, Double>> confidenceIntervals;
    
    @JsonProperty("risk_metrics")
    private Map<String, Double> riskMetrics;

    public Double getMeanReturn() {
        return meanReturn;
    }

    public void setMeanReturn(Double meanReturn) {
        this.meanReturn = meanReturn;
    }

    public Double getVolatility() {
        return volatility;
    }

    public void setVolatility(Double volatility) {
        this.volatility = volatility;
    }

    public Double getSkewness() {
        return skewness;
    }

    public void setSkewness(Double skewness) {
        this.skewness = skewness;
    }

    public Double getKurtosis() {
        return kurtosis;
    }

    public void setKurtosis(Double kurtosis) {
        this.kurtosis = kurtosis;
    }

    public Double getSharpeRatio() {
        return sharpeRatio;
    }

    public void setSharpeRatio(Double sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }

    public Double getDownsideDeviation() {
        return downsideDeviation;
    }

    public void setDownsideDeviation(Double downsideDeviation) {
        this.downsideDeviation = downsideDeviation;
    }

    public Double getMaximumDrawdown() {
        return maximumDrawdown;
    }

    public void setMaximumDrawdown(Double maximumDrawdown) {
        this.maximumDrawdown = maximumDrawdown;
    }

    public Map<String, Map<String, Double>> getConfidenceIntervals() {
        return confidenceIntervals;
    }

    public void setConfidenceIntervals(Map<String, Map<String, Double>> confidenceIntervals) {
        this.confidenceIntervals = confidenceIntervals;
    }

    public Map<String, Double> getRiskMetrics() {
        return riskMetrics;
    }

    public void setRiskMetrics(Map<String, Double> riskMetrics) {
        this.riskMetrics = riskMetrics;
    }
}