package com.portfolio.riskanalyzer.dto;

public class RiskMetrics {
    private Double volatility;
    private Double sharpeRatio;
    private Double maxDrawdown;
    private Double diversificationScore;
    private Double expectedReturn;
    private Double sortinoRatio;
    private Double calmarRatio;
    private Double valueAtRisk95;
    private Double conditionalVar95;

    public RiskMetrics() {}

    public Double getVolatility() {
        return volatility;
    }

    public void setVolatility(Double volatility) {
        this.volatility = volatility;
    }

    public Double getSharpeRatio() {
        return sharpeRatio;
    }

    public void setSharpeRatio(Double sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }

    public Double getMaxDrawdown() {
        return maxDrawdown;
    }

    public void setMaxDrawdown(Double maxDrawdown) {
        this.maxDrawdown = maxDrawdown;
    }

    public Double getDiversificationScore() {
        return diversificationScore;
    }

    public void setDiversificationScore(Double diversificationScore) {
        this.diversificationScore = diversificationScore;
    }

    public Double getExpectedReturn() {
        return expectedReturn;
    }

    public void setExpectedReturn(Double expectedReturn) {
        this.expectedReturn = expectedReturn;
    }

    public Double getSortinoRatio() {
        return sortinoRatio;
    }

    public void setSortinoRatio(Double sortinoRatio) {
        this.sortinoRatio = sortinoRatio;
    }

    public Double getCalmarRatio() {
        return calmarRatio;
    }

    public void setCalmarRatio(Double calmarRatio) {
        this.calmarRatio = calmarRatio;
    }

    public Double getValueAtRisk95() {
        return valueAtRisk95;
    }

    public void setValueAtRisk95(Double valueAtRisk95) {
        this.valueAtRisk95 = valueAtRisk95;
    }

    public Double getConditionalVar95() {
        return conditionalVar95;
    }

    public void setConditionalVar95(Double conditionalVar95) {
        this.conditionalVar95 = conditionalVar95;
    }
}