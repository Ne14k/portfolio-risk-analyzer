"""Historical Data Service using Finnhub API"""

import asyncio
import aiohttp
import pandas as pd
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime, timedelta, date
import logging
import os
from dotenv import load_dotenv

from models.forecasting_models import HistoricalDataPoint

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class HistoricalDataService:
    
    def __init__(self):
        self.finnhub_token = os.getenv('FINNHUB_API_KEY', 'demo_token')
        self.base_url = "https://finnhub.io/api/v1"
        self.session = None
        self.rate_limit_delay = 1.0  # 1 second between calls for free tier
        
    async def initialize(self):
        """Initialize HTTP session"""
        if not self.session:
            self.session = aiohttp.ClientSession()
            logger.info("✅ Historical data service initialized")
    
    async def cleanup(self):
        """Clean up HTTP session"""
        if self.session:
            await self.session.close()
            logger.info("🔄 Historical data service cleaned up")
    
    async def fetch_historical_data(self, ticker: str, days: int = 365) -> List[HistoricalDataPoint]:
        """
        Fetch historical stock data from Finnhub
        
        Args:
            ticker: Stock ticker symbol
            days: Number of days of historical data to fetch
            
        Returns:
            List of historical data points
        """
        try:
            logger.info(f"📊 Fetching {days} days of historical data for {ticker}")
            
            if not self.session:
                await self.initialize()
            
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Convert to Unix timestamps
            start_ts = int(start_date.timestamp())
            end_ts = int(end_date.timestamp())
            
            # Prepare API request
            url = f"{self.base_url}/stock/candle"
            params = {
                'symbol': ticker,
                'resolution': 'D',  # Daily resolution
                'from': start_ts,
                'to': end_ts,
                'token': self.finnhub_token
            }
            
            # Make API request with rate limiting
            await asyncio.sleep(self.rate_limit_delay)
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get('s') == 'ok' and data.get('c'):
                        return self._parse_candle_data(data)
                    else:
                        logger.warning(f"⚠️ No data returned for {ticker}")
                        return []
                else:
                    logger.error(f"❌ API request failed for {ticker}: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"❌ Error fetching historical data for {ticker}: {str(e)}")
            return []
    
    def _parse_candle_data(self, data: dict) -> List[HistoricalDataPoint]:
        """Parse Finnhub candle data into HistoricalDataPoint objects"""
        try:
            timestamps = data['t']
            closes = data['c']
            volumes = data.get('v', [])
            
            historical_data = []
            
            for i, (timestamp, close) in enumerate(zip(timestamps, closes)):
                data_point = HistoricalDataPoint(
                    date=datetime.fromtimestamp(timestamp).date(),
                    price=float(close),
                    volume=int(volumes[i]) if i < len(volumes) else None
                )
                historical_data.append(data_point)
            
            # Sort by date
            historical_data.sort(key=lambda x: x.date)
            
            logger.info(f"✅ Parsed {len(historical_data)} historical data points")
            return historical_data
            
        except Exception as e:
            logger.error(f"❌ Error parsing candle data: {str(e)}")
            return []
    
    async def fetch_multiple_tickers(self, tickers: List[str], days: int = 365) -> Dict[str, List[HistoricalDataPoint]]:
        """
        Fetch historical data for multiple tickers with rate limiting
        
        Args:
            tickers: List of ticker symbols
            days: Number of days of historical data
            
        Returns:
            Dictionary mapping ticker to historical data
        """
        try:
            logger.info(f"📊 Fetching historical data for {len(tickers)} tickers")
            
            results = {}
            
            # Process tickers sequentially to respect rate limits
            for ticker in tickers:
                try:
                    data = await self.fetch_historical_data(ticker, days)
                    results[ticker] = data
                    
                    if data:
                        logger.info(f"✅ Successfully fetched data for {ticker}: {len(data)} points")
                    else:
                        logger.warning(f"⚠️ No data found for {ticker}")
                        
                except Exception as e:
                    logger.error(f"❌ Error fetching data for {ticker}: {str(e)}")
                    results[ticker] = []
            
            return results
            
        except Exception as e:
            logger.error(f"❌ Error in batch fetch: {str(e)}")
            return {}
    
    async def get_current_price(self, ticker: str) -> Optional[float]:
        """Get current price for a ticker"""
        try:
            if not self.session:
                await self.initialize()
            
            url = f"{self.base_url}/quote"
            params = {
                'symbol': ticker,
                'token': self.finnhub_token
            }
            
            await asyncio.sleep(self.rate_limit_delay)
            
            async with self.session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    current_price = data.get('c')  # Current price
                    
                    if current_price and current_price > 0:
                        return float(current_price)
                    else:
                        logger.warning(f"⚠️ Invalid current price for {ticker}")
                        return None
                else:
                    logger.error(f"❌ Failed to get current price for {ticker}: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"❌ Error getting current price for {ticker}: {str(e)}")
            return None
    
    def validate_ticker(self, ticker: str) -> bool:
        """Basic ticker validation"""
        if not ticker or not isinstance(ticker, str):
            return False
        
        # Basic format validation
        ticker = ticker.upper().strip()
        if len(ticker) < 1 or len(ticker) > 5:
            return False
        
        # Check for valid characters
        if not ticker.isalnum():
            return False
        
        return True
    
    def get_training_period_days(self, time_horizon: str) -> int:
        """Get recommended training period based on forecast horizon"""
        horizon_to_training = {
            "1_month": 365,      # 1 year of data for 1 month forecast
            "3_months": 730,     # 2 years of data for 3 month forecast  
            "1_year": 1095       # 3 years of data for 1 year forecast
        }
        
        return horizon_to_training.get(time_horizon, 365)
    
    def create_fallback_data(self, ticker: str, current_price: float, days: int = 30) -> List[HistoricalDataPoint]:
        """Create fallback historical data if API fails"""
        logger.info(f"📊 Creating fallback data for {ticker}")
        
        fallback_data = []
        base_date = datetime.now().date()
        
        # Create synthetic data with slight random walk
        price = current_price
        np.random.seed(hash(ticker) % 2**32)  # Deterministic randomness per ticker
        
        for i in range(days):
            # Random walk with slight downward bias to be conservative
            daily_change = np.random.normal(-0.001, 0.02)  # -0.1% average daily change, 2% volatility
            price *= (1 + daily_change)
            price = max(price, 0.01)  # Prevent negative prices
            
            data_point = HistoricalDataPoint(
                date=base_date - timedelta(days=days-i),
                price=round(price, 2),
                volume=None
            )
            fallback_data.append(data_point)
        
        return fallback_data