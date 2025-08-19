package com.portfolio.riskanalyzer.controller;

import com.portfolio.riskanalyzer.dto.PortfolioDto;
import com.portfolio.riskanalyzer.dto.HoldingDto;
import com.portfolio.riskanalyzer.service.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/portfolios")
@CrossOrigin(origins = {"http://localhost:3000", "https://myportfoliotracker.xyz"})
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @GetMapping("/{userId}")
    public ResponseEntity<PortfolioDto> getUserPortfolio(@PathVariable String userId) {
        PortfolioDto portfolio = portfolioService.getUserPortfolio(userId);
        return ResponseEntity.ok(portfolio);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<PortfolioDto> createOrUpdatePortfolio(
            @PathVariable String userId,
            @Valid @RequestBody PortfolioDto portfolio) {
        
        PortfolioDto savedPortfolio = portfolioService.savePortfolio(userId, portfolio);
        return ResponseEntity.ok(savedPortfolio);
    }

    @PostMapping("/{userId}/holdings")
    public ResponseEntity<HoldingDto> addHolding(
            @PathVariable String userId,
            @Valid @RequestBody HoldingDto holding) {
        
        HoldingDto savedHolding = portfolioService.addHolding(userId, holding);
        return ResponseEntity.ok(savedHolding);
    }

    @PutMapping("/{userId}/holdings/{holdingId}")
    public ResponseEntity<HoldingDto> updateHolding(
            @PathVariable String userId,
            @PathVariable String holdingId,
            @Valid @RequestBody HoldingDto holding) {
        
        HoldingDto updatedHolding = portfolioService.updateHolding(userId, holdingId, holding);
        return ResponseEntity.ok(updatedHolding);
    }

    @DeleteMapping("/{userId}/holdings/{holdingId}")
    public ResponseEntity<Void> deleteHolding(
            @PathVariable String userId,
            @PathVariable String holdingId) {
        
        portfolioService.deleteHolding(userId, holdingId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearPortfolio(@PathVariable String userId) {
        portfolioService.clearPortfolio(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/refresh-prices")
    public ResponseEntity<PortfolioDto> refreshPrices(@PathVariable String userId) {
        PortfolioDto portfolio = portfolioService.refreshHoldingPrices(userId);
        return ResponseEntity.ok(portfolio);
    }
}