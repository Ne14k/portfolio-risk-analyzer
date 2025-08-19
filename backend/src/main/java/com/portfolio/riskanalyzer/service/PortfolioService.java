package com.portfolio.riskanalyzer.service;

import com.portfolio.riskanalyzer.dto.*;
import com.portfolio.riskanalyzer.model.Portfolio;
import com.portfolio.riskanalyzer.model.Holding;
import com.portfolio.riskanalyzer.repository.PortfolioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PortfolioService {

    private static final Logger logger = LoggerFactory.getLogger(PortfolioService.class);

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private ExternalDataService externalDataService;

    public PortfolioDto getUserPortfolio(String userId) {
        try {
            logger.info("📊 Fetching portfolio for user: {}", userId);
            
            Optional<Portfolio> portfolio = portfolioRepository.findByUserId(userId);
            
            if (portfolio.isPresent()) {
                return convertToDto(portfolio.get());
            } else {
                return createEmptyPortfolio(userId);
            }
            
        } catch (Exception e) {
            logger.error("❌ Error fetching portfolio for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to fetch portfolio: " + e.getMessage());
        }
    }

    public PortfolioDto savePortfolio(String userId, PortfolioDto portfolioDto) {
        try {
            logger.info("💾 Saving portfolio for user: {}", userId);
            
            Portfolio portfolio = convertToEntity(portfolioDto);
            portfolio.setUserId(userId);
            portfolio.setLastUpdated(LocalDateTime.now());
            portfolio.calculateMetrics();
            
            Portfolio savedPortfolio = portfolioRepository.save(portfolio);
            
            logger.info("✅ Portfolio saved successfully for user: {}", userId);
            return convertToDto(savedPortfolio);
            
        } catch (Exception e) {
            logger.error("❌ Error saving portfolio for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to save portfolio: " + e.getMessage());
        }
    }

    public HoldingDto addHolding(String userId, HoldingDto holdingDto) {
        try {
            logger.info("➕ Adding holding {} for user: {}", holdingDto.getTicker(), userId);
            
            Portfolio portfolio = getOrCreatePortfolio(userId);
            
            Holding holding = convertHoldingToEntity(holdingDto);
            holding.setId(UUID.randomUUID().toString());
            holding.setLastUpdated(LocalDateTime.now());
            holding.calculateMetrics();
            
            portfolio.getHoldings().add(holding);
            portfolio.setLastUpdated(LocalDateTime.now());
            portfolio.calculateMetrics();
            
            portfolioRepository.save(portfolio);
            
            logger.info("✅ Holding added successfully: {}", holding.getTicker());
            return convertHoldingToDto(holding);
            
        } catch (Exception e) {
            logger.error("❌ Error adding holding for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to add holding: " + e.getMessage());
        }
    }

    public HoldingDto updateHolding(String userId, String holdingId, HoldingDto holdingDto) {
        try {
            logger.info("✏️ Updating holding {} for user: {}", holdingId, userId);
            
            Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
            
            Holding holding = portfolio.getHoldings().stream()
                .filter(h -> h.getId().equals(holdingId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Holding not found"));
            
            updateHoldingFromDto(holding, holdingDto);
            holding.setLastUpdated(LocalDateTime.now());
            holding.calculateMetrics();
            
            portfolio.setLastUpdated(LocalDateTime.now());
            portfolio.calculateMetrics();
            
            portfolioRepository.save(portfolio);
            
            logger.info("✅ Holding updated successfully: {}", holding.getTicker());
            return convertHoldingToDto(holding);
            
        } catch (Exception e) {
            logger.error("❌ Error updating holding {} for user {}: {}", holdingId, userId, e.getMessage());
            throw new RuntimeException("Failed to update holding: " + e.getMessage());
        }
    }

    public void deleteHolding(String userId, String holdingId) {
        try {
            logger.info("🗑️ Deleting holding {} for user: {}", holdingId, userId);
            
            Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
            
            portfolio.getHoldings().removeIf(h -> h.getId().equals(holdingId));
            portfolio.setLastUpdated(LocalDateTime.now());
            portfolio.calculateMetrics();
            
            portfolioRepository.save(portfolio);
            
            logger.info("✅ Holding deleted successfully: {}", holdingId);
            
        } catch (Exception e) {
            logger.error("❌ Error deleting holding {} for user {}: {}", holdingId, userId, e.getMessage());
            throw new RuntimeException("Failed to delete holding: " + e.getMessage());
        }
    }

    public void clearPortfolio(String userId) {
        try {
            logger.info("🧹 Clearing portfolio for user: {}", userId);
            
            portfolioRepository.deleteByUserId(userId);
            
            logger.info("✅ Portfolio cleared successfully for user: {}", userId);
            
        } catch (Exception e) {
            logger.error("❌ Error clearing portfolio for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to clear portfolio: " + e.getMessage());
        }
    }

    public PortfolioDto refreshHoldingPrices(String userId) {
        try {
            logger.info("🔄 Refreshing holding prices for user: {}", userId);
            
            Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
            
            for (Holding holding : portfolio.getHoldings()) {
                try {
                    Double newPrice = externalDataService.getCurrentPrice(holding.getTicker());
                    if (newPrice != null && newPrice > 0) {
                        holding.setCurrentPrice(newPrice);
                        holding.setLastUpdated(LocalDateTime.now());
                        holding.calculateMetrics();
                    }
                } catch (Exception e) {
                    logger.warn("⚠️ Failed to update price for {}: {}", holding.getTicker(), e.getMessage());
                }
            }
            
            portfolio.setLastUpdated(LocalDateTime.now());
            portfolio.calculateMetrics();
            
            Portfolio savedPortfolio = portfolioRepository.save(portfolio);
            
            logger.info("✅ Holding prices refreshed successfully for user: {}", userId);
            return convertToDto(savedPortfolio);
            
        } catch (Exception e) {
            logger.error("❌ Error refreshing prices for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to refresh prices: " + e.getMessage());
        }
    }

    private Portfolio getOrCreatePortfolio(String userId) {
        Optional<Portfolio> existingPortfolio = portfolioRepository.findByUserId(userId);
        if (existingPortfolio.isPresent()) {
            return existingPortfolio.get();
        }
        
        Portfolio newPortfolio = new Portfolio();
        newPortfolio.setId(UUID.randomUUID().toString());
        newPortfolio.setUserId(userId);
        newPortfolio.setName("My Portfolio");
        newPortfolio.setLastUpdated(LocalDateTime.now());
        
        return newPortfolio;
    }

    private PortfolioDto createEmptyPortfolio(String userId) {
        PortfolioDto portfolio = new PortfolioDto();
        portfolio.setId(UUID.randomUUID().toString());
        portfolio.setName("My Portfolio");
        portfolio.setHoldings(List.of());
        portfolio.setTotalValue(0.0);
        portfolio.setTotalGainLoss(0.0);
        portfolio.setTotalGainLossPercentage(0.0);
        portfolio.setAssetAllocation(new AssetAllocationDto(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0));
        portfolio.setLastUpdated(LocalDateTime.now());
        
        return portfolio;
    }

    private PortfolioDto convertToDto(Portfolio portfolio) {
        PortfolioDto dto = new PortfolioDto();
        dto.setId(portfolio.getId());
        dto.setName(portfolio.getName());
        dto.setTotalValue(portfolio.getTotalValue());
        dto.setTotalGainLoss(portfolio.getTotalGainLoss());
        dto.setTotalGainLossPercentage(portfolio.getTotalGainLossPercentage());
        dto.setLastUpdated(portfolio.getLastUpdated());
        
        if (portfolio.getHoldings() != null) {
            dto.setHoldings(portfolio.getHoldings().stream()
                .map(this::convertHoldingToDto)
                .collect(Collectors.toList()));
        }
        
        if (portfolio.getAssetAllocation() != null) {
            dto.setAssetAllocation(convertAssetAllocationToDto(portfolio.getAssetAllocation()));
        }
        
        return dto;
    }

    private Portfolio convertToEntity(PortfolioDto dto) {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(dto.getId());
        portfolio.setName(dto.getName());
        portfolio.setTotalValue(dto.getTotalValue());
        portfolio.setTotalGainLoss(dto.getTotalGainLoss());
        portfolio.setTotalGainLossPercentage(dto.getTotalGainLossPercentage());
        portfolio.setLastUpdated(dto.getLastUpdated());
        
        if (dto.getHoldings() != null) {
            portfolio.setHoldings(dto.getHoldings().stream()
                .map(this::convertHoldingToEntity)
                .collect(Collectors.toList()));
        }
        
        return portfolio;
    }

    private HoldingDto convertHoldingToDto(Holding holding) {
        HoldingDto dto = new HoldingDto();
        dto.setId(holding.getId());
        dto.setTicker(holding.getTicker());
        dto.setName(holding.getName());
        dto.setQuantity(holding.getQuantity());
        dto.setPurchasePrice(holding.getPurchasePrice());
        dto.setCurrentPrice(holding.getCurrentPrice());
        dto.setCategory(holding.getCategory().name());
        dto.setMarketValue(holding.getMarketValue());
        dto.setGainLoss(holding.getGainLoss());
        dto.setGainLossPercentage(holding.getGainLossPercentage());
        dto.setLastUpdated(holding.getLastUpdated());
        
        return dto;
    }

    private Holding convertHoldingToEntity(HoldingDto dto) {
        Holding holding = new Holding();
        holding.setId(dto.getId());
        holding.setTicker(dto.getTicker());
        holding.setName(dto.getName());
        holding.setQuantity(dto.getQuantity());
        holding.setPurchasePrice(dto.getPurchasePrice());
        holding.setCurrentPrice(dto.getCurrentPrice());
        holding.setCategory(Holding.AssetCategory.valueOf(dto.getCategory().toUpperCase()));
        holding.setMarketValue(dto.getMarketValue());
        holding.setGainLoss(dto.getGainLoss());
        holding.setGainLossPercentage(dto.getGainLossPercentage());
        holding.setLastUpdated(dto.getLastUpdated());
        
        return holding;
    }

    private void updateHoldingFromDto(Holding holding, HoldingDto dto) {
        holding.setTicker(dto.getTicker());
        holding.setName(dto.getName());
        holding.setQuantity(dto.getQuantity());
        holding.setPurchasePrice(dto.getPurchasePrice());
        holding.setCurrentPrice(dto.getCurrentPrice());
        holding.setCategory(Holding.AssetCategory.valueOf(dto.getCategory().toUpperCase()));
    }

    private AssetAllocationDto convertAssetAllocationToDto(com.portfolio.riskanalyzer.model.AssetAllocation allocation) {
        return new AssetAllocationDto(
            allocation.getStocks(),
            allocation.getEtfs(),
            allocation.getCrypto(),
            allocation.getBonds(),
            allocation.getRealEstate(),
            allocation.getCash(),
            allocation.getCommodities()
        );
    }
}