package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class MonteCarloResultsDto {
    
    @JsonProperty("num_simulations")
    private Integer numSimulations;
    
    @JsonProperty("percentile_5")
    private List<Double> percentile5;
    
    @JsonProperty("percentile_25")
    private List<Double> percentile25;
    
    @JsonProperty("percentile_50")
    private List<Double> percentile50;
    
    @JsonProperty("percentile_75")
    private List<Double> percentile75;
    
    @JsonProperty("percentile_95")
    private List<Double> percentile95;
    
    @JsonProperty("probability_positive")
    private Double probabilityPositive;
    
    @JsonProperty("probability_loss_5_percent")
    private Double probabilityLoss5Percent;
    
    @JsonProperty("probability_loss_10_percent")
    private Double probabilityLoss10Percent;
    
    @JsonProperty("probability_gain_10_percent")
    private Double probabilityGain10Percent;
    
    @JsonProperty("probability_gain_20_percent")
    private Double probabilityGain20Percent;
    
    @JsonProperty("expected_value")
    private Double expectedValue;
    
    @JsonProperty("value_at_risk_5")
    private Double valueAtRisk5;
    
    @JsonProperty("value_at_risk_1")
    private Double valueAtRisk1;
    
    @JsonProperty("conditional_value_at_risk")
    private Double conditionalValueAtRisk;
    
    @JsonProperty("simulation_summary")
    private MonteCarloSummaryDto simulationSummary;

    public Integer getNumSimulations() {
        return numSimulations;
    }

    public void setNumSimulations(Integer numSimulations) {
        this.numSimulations = numSimulations;
    }

    public List<Double> getPercentile5() {
        return percentile5;
    }

    public void setPercentile5(List<Double> percentile5) {
        this.percentile5 = percentile5;
    }

    public List<Double> getPercentile25() {
        return percentile25;
    }

    public void setPercentile25(List<Double> percentile25) {
        this.percentile25 = percentile25;
    }

    public List<Double> getPercentile50() {
        return percentile50;
    }

    public void setPercentile50(List<Double> percentile50) {
        this.percentile50 = percentile50;
    }

    public List<Double> getPercentile75() {
        return percentile75;
    }

    public void setPercentile75(List<Double> percentile75) {
        this.percentile75 = percentile75;
    }

    public List<Double> getPercentile95() {
        return percentile95;
    }

    public void setPercentile95(List<Double> percentile95) {
        this.percentile95 = percentile95;
    }

    public Double getProbabilityPositive() {
        return probabilityPositive;
    }

    public void setProbabilityPositive(Double probabilityPositive) {
        this.probabilityPositive = probabilityPositive;
    }

    public Double getProbabilityLoss5Percent() {
        return probabilityLoss5Percent;
    }

    public void setProbabilityLoss5Percent(Double probabilityLoss5Percent) {
        this.probabilityLoss5Percent = probabilityLoss5Percent;
    }

    public Double getProbabilityLoss10Percent() {
        return probabilityLoss10Percent;
    }

    public void setProbabilityLoss10Percent(Double probabilityLoss10Percent) {
        this.probabilityLoss10Percent = probabilityLoss10Percent;
    }

    public Double getProbabilityGain10Percent() {
        return probabilityGain10Percent;
    }

    public void setProbabilityGain10Percent(Double probabilityGain10Percent) {
        this.probabilityGain10Percent = probabilityGain10Percent;
    }

    public Double getProbabilityGain20Percent() {
        return probabilityGain20Percent;
    }

    public void setProbabilityGain20Percent(Double probabilityGain20Percent) {
        this.probabilityGain20Percent = probabilityGain20Percent;
    }

    public Double getExpectedValue() {
        return expectedValue;
    }

    public void setExpectedValue(Double expectedValue) {
        this.expectedValue = expectedValue;
    }

    public Double getValueAtRisk5() {
        return valueAtRisk5;
    }

    public void setValueAtRisk5(Double valueAtRisk5) {
        this.valueAtRisk5 = valueAtRisk5;
    }

    public Double getValueAtRisk1() {
        return valueAtRisk1;
    }

    public void setValueAtRisk1(Double valueAtRisk1) {
        this.valueAtRisk1 = valueAtRisk1;
    }

    public Double getConditionalValueAtRisk() {
        return conditionalValueAtRisk;
    }

    public void setConditionalValueAtRisk(Double conditionalValueAtRisk) {
        this.conditionalValueAtRisk = conditionalValueAtRisk;
    }

    public MonteCarloSummaryDto getSimulationSummary() {
        return simulationSummary;
    }

    public void setSimulationSummary(MonteCarloSummaryDto simulationSummary) {
        this.simulationSummary = simulationSummary;
    }
}