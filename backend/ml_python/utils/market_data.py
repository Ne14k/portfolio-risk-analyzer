"""Market Data Provider"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional
import asyncio
import logging

from models.portfolio_models import AssetClass

logger = logging.getLogger(__name__)

class MarketDataProvider:
    
    def __init__(self):
        self.asset_data = {}
        self.correlation_matrix = None
        self.initialized = False
    
    async def initialize(self):
        try:
            logger.info("🔄 Initializing market data provider")
            
            self.asset_data = {
                "stocks": {
                    "return": 0.10,
                    "volatility": 0.16,
                    "esg_score": 0.65,
                    "tax_efficiency": 0.7,
                    "liquidity": 0.95,
                    "sector_exposure": {
                        "technology": 0.3,
                        "healthcare": 0.15,
                        "financials": 0.15,
                        "energy": 0.1,
                        "other": 0.3
                    }
                },
                "bonds": {
                    "return": 0.04,
                    "volatility": 0.04,
                    "esg_score": 0.55,
                    "tax_efficiency": 0.6,
                    "liquidity": 0.85,
                    "sector_exposure": {
                        "government": 0.6,
                        "corporate": 0.4
                    }
                },
                "alternatives": {
                    "return": 0.08,
                    "volatility": 0.12,
                    "esg_score": 0.45,
                    "tax_efficiency": 0.8,
                    "liquidity": 0.6,
                    "sector_exposure": {
                        "real_estate": 0.5,
                        "commodities": 0.3,
                        "private_equity": 0.2
                    }
                },
                "cash": {
                    "return": 0.02,
                    "volatility": 0.01,
                    "esg_score": 0.9,
                    "tax_efficiency": 0.5,
                    "liquidity": 1.0,
                    "sector_exposure": {}
                }
            }
            
            self.correlation_matrix = np.array([
                [1.0, 0.2, 0.6, 0.1],
                [0.2, 1.0, 0.3, 0.0],
                [0.6, 0.3, 1.0, 0.1],
                [0.1, 0.0, 0.1, 1.0]
            ])
            
            self.initialized = True
            logger.info("✅ Market data provider initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize market data provider: {str(e)}")
            raise
    
    async def get_asset_data(self) -> Dict:
        if not self.initialized:
            await self.initialize()
        return self.asset_data
    
    async def get_correlation_matrix(self) -> np.ndarray:
        if not self.initialized:
            await self.initialize()
        return self.correlation_matrix
    
    async def get_asset_classes(self) -> List[AssetClass]:
        if not self.initialized:
            await self.initialize()
        
        asset_classes = []
        
        for asset_name, data in self.asset_data.items():
            display_names = {
                "stocks": "Stocks",
                "bonds": "Bonds", 
                "alternatives": "Alternatives",
                "cash": "Cash"
            }
            
            descriptions = {
                "stocks": "Equity investments for long-term growth",
                "bonds": "Fixed income for stability and income",
                "alternatives": "REITs, commodities, and other alternatives",
                "cash": "Cash and short-term instruments for liquidity"
            }
            
            asset_class = AssetClass(
                name=asset_name,
                display_name=display_names[asset_name],
                expected_return=data["return"] * 100,
                volatility=data["volatility"] * 100,
                description=descriptions[asset_name],
                esg_score=data["esg_score"],
                tax_efficiency=data["tax_efficiency"],
                liquidity=data["liquidity"],
                sector_exposure=data["sector_exposure"]
            )
            
            asset_classes.append(asset_class)
        
        return asset_classes
    
    async def cleanup(self):
        logger.info("🔄 Cleaning up market data provider")
        self.initialized = False