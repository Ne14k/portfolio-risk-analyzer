package com.portfolio.riskanalyzer.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AssetForecastDto {
    
    private String ticker;
    
    @JsonProperty("current_price")
    private Double currentPrice;
    
    @JsonProperty("forecasted_prices")
    private List<ForecastPointDto> forecastedPrices;
    
    @JsonProperty("model_metrics")
    private ModelMetricsDto modelMetrics;

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public Double getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Double currentPrice) {
        this.currentPrice = currentPrice;
    }

    public List<ForecastPointDto> getForecastedPrices() {
        return forecastedPrices;
    }

    public void setForecastedPrices(List<ForecastPointDto> forecastedPrices) {
        this.forecastedPrices = forecastedPrices;
    }

    public ModelMetricsDto getModelMetrics() {
        return modelMetrics;
    }

    public void setModelMetrics(ModelMetricsDto modelMetrics) {
        this.modelMetrics = modelMetrics;
    }
}