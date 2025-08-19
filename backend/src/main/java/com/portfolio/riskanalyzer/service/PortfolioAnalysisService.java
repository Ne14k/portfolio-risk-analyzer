package com.portfolio.riskanalyzer.service;

import com.portfolio.riskanalyzer.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PortfolioAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioAnalysisService.class);

    @Autowired
    private MLServiceClient mlServiceClient;

    public OptimizationResult analyzeAndOptimize(PortfolioAnalysisRequest request) {
        try {
            logger.info("🎯 Starting portfolio analysis and optimization");
            
            validateAllocation(request.getAllocation());
            
            OptimizationResult result = mlServiceClient.optimizePortfolio(request);
            
            logger.info("✅ Portfolio analysis completed successfully");
            return result;
            
        } catch (Exception e) {
            logger.error("❌ Portfolio analysis failed: {}", e.getMessage());
            throw new RuntimeException("Portfolio analysis failed: " + e.getMessage());
        }
    }

    public RiskMetrics calculateRiskMetrics(PortfolioAllocation allocation) {
        try {
            logger.info("🔍 Calculating risk metrics for portfolio allocation");
            
            validateAllocation(allocation);
            
            RiskMetrics metrics = mlServiceClient.calculateRiskMetrics(allocation);
            
            logger.info("✅ Risk metrics calculated successfully");
            return metrics;
            
        } catch (Exception e) {
            logger.error("❌ Risk metrics calculation failed: {}", e.getMessage());
            throw new RuntimeException("Risk metrics calculation failed: " + e.getMessage());
        }
    }

    private void validateAllocation(PortfolioAllocation allocation) {
        if (allocation == null) {
            throw new IllegalArgumentException("Portfolio allocation cannot be null");
        }
        
        if (!allocation.isValidAllocation()) {
            throw new IllegalArgumentException("Portfolio allocation must sum to 1.0 (100%)");
        }
        
        if (allocation.getStocks() < 0 || allocation.getBonds() < 0 || 
            allocation.getAlternatives() < 0 || allocation.getCash() < 0) {
            throw new IllegalArgumentException("Allocation values cannot be negative");
        }
    }

    public boolean isMLServiceHealthy() {
        return mlServiceClient.isHealthy();
    }
}