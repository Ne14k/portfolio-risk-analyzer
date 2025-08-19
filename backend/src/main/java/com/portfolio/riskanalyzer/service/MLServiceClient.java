package com.portfolio.riskanalyzer.service;

import com.portfolio.riskanalyzer.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
public class MLServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(MLServiceClient.class);

    private final WebClient webClient;

    public MLServiceClient(@Value("${ml.service.url:http://localhost:8001}") String mlServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(mlServiceUrl)
                .build();
    }

    public RiskMetrics calculateRiskMetrics(PortfolioAllocation allocation) {
        try {
            logger.info("🔍 Calling ML service for risk metrics calculation");
            
            return webClient.post()
                    .uri("/analyze/risk")
                    .bodyValue(allocation)
                    .retrieve()
                    .bodyToMono(RiskMetrics.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();
                    
        } catch (WebClientResponseException e) {
            logger.error("❌ ML service error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to calculate risk metrics: " + e.getMessage());
        } catch (Exception e) {
            logger.error("❌ Error calling ML service: {}", e.getMessage());
            throw new RuntimeException("ML service unavailable: " + e.getMessage());
        }
    }

    public OptimizationResult optimizePortfolio(PortfolioAnalysisRequest request) {
        try {
            logger.info("🎯 Calling ML service for portfolio optimization");
            
            return webClient.post()
                    .uri("/optimize/portfolio")
                    .bodyValue(convertToMLRequest(request))
                    .retrieve()
                    .bodyToMono(OptimizationResult.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();
                    
        } catch (WebClientResponseException e) {
            logger.error("❌ ML service error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to optimize portfolio: " + e.getMessage());
        } catch (Exception e) {
            logger.error("❌ Error calling ML service: {}", e.getMessage());
            throw new RuntimeException("ML service unavailable: " + e.getMessage());
        }
    }

    public boolean isHealthy() {
        try {
            String response = webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
            
            return response != null && response.contains("healthy");
            
        } catch (Exception e) {
            logger.warn("⚠️ ML service health check failed: {}", e.getMessage());
            return false;
        }
    }

    private MLPortfolioRequest convertToMLRequest(PortfolioAnalysisRequest request) {
        MLPortfolioRequest mlRequest = new MLPortfolioRequest();
        mlRequest.setAllocation(request.getAllocation());
        mlRequest.setRiskTolerance(request.getRiskTolerance());
        mlRequest.setTargetReturn(request.getTargetReturn());
        mlRequest.setTimeHorizon(request.getTimeHorizon());
        mlRequest.setOptimizationGoal(request.getOptimizationGoal());
        mlRequest.setEsgPreferences(request.getEsgPreferences());
        mlRequest.setTaxPreferences(request.getTaxPreferences());
        mlRequest.setSectorPreferences(request.getSectorPreferences());
        mlRequest.setUseAiOptimization(request.getUseAiOptimization());
        
        return mlRequest;
    }

    private static class MLPortfolioRequest {
        private PortfolioAllocation allocation;
        private String riskTolerance;
        private Double targetReturn;
        private Integer timeHorizon;
        private String optimizationGoal;
        private ESGPreferences esgPreferences;
        private TaxPreferences taxPreferences;
        private SectorPreferences sectorPreferences;
        private Boolean useAiOptimization;

        public PortfolioAllocation getAllocation() {
            return allocation;
        }

        public void setAllocation(PortfolioAllocation allocation) {
            this.allocation = allocation;
        }

        public String getRiskTolerance() {
            return riskTolerance;
        }

        public void setRiskTolerance(String riskTolerance) {
            this.riskTolerance = riskTolerance;
        }

        public Double getTargetReturn() {
            return targetReturn;
        }

        public void setTargetReturn(Double targetReturn) {
            this.targetReturn = targetReturn;
        }

        public Integer getTimeHorizon() {
            return timeHorizon;
        }

        public void setTimeHorizon(Integer timeHorizon) {
            this.timeHorizon = timeHorizon;
        }

        public String getOptimizationGoal() {
            return optimizationGoal;
        }

        public void setOptimizationGoal(String optimizationGoal) {
            this.optimizationGoal = optimizationGoal;
        }

        public ESGPreferences getEsgPreferences() {
            return esgPreferences;
        }

        public void setEsgPreferences(ESGPreferences esgPreferences) {
            this.esgPreferences = esgPreferences;
        }

        public TaxPreferences getTaxPreferences() {
            return taxPreferences;
        }

        public void setTaxPreferences(TaxPreferences taxPreferences) {
            this.taxPreferences = taxPreferences;
        }

        public SectorPreferences getSectorPreferences() {
            return sectorPreferences;
        }

        public void setSectorPreferences(SectorPreferences sectorPreferences) {
            this.sectorPreferences = sectorPreferences;
        }

        public Boolean getUseAiOptimization() {
            return useAiOptimization;
        }

        public void setUseAiOptimization(Boolean useAiOptimization) {
            this.useAiOptimization = useAiOptimization;
        }
    }
}