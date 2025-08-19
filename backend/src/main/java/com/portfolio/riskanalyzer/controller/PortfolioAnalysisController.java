package com.portfolio.riskanalyzer.controller;

import com.portfolio.riskanalyzer.dto.PortfolioAnalysisRequest;
import com.portfolio.riskanalyzer.dto.OptimizationResult;
import com.portfolio.riskanalyzer.dto.RiskMetrics;
import com.portfolio.riskanalyzer.service.PortfolioAnalysisService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/portfolio")
@CrossOrigin(origins = {"http://localhost:3000", "https://myportfoliotracker.xyz"})
public class PortfolioAnalysisController {

    @Autowired
    private PortfolioAnalysisService analysisService;

    @PostMapping("/analyze")
    public ResponseEntity<OptimizationResult> analyzePortfolio(
            @Valid @RequestBody PortfolioAnalysisRequest request) {
        
        OptimizationResult result = analysisService.analyzeAndOptimize(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/risk-metrics")
    public ResponseEntity<RiskMetrics> calculateRiskMetrics(
            @Valid @RequestBody PortfolioAnalysisRequest request) {
        
        RiskMetrics metrics = analysisService.calculateRiskMetrics(request.getAllocation());
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Portfolio Analysis Service is healthy");
    }
}