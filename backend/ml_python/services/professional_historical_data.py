"""
Professional Historical Data Service
Provides real financial data for Monte Carlo simulations
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional, Tuple
from datetime import datetime, date, timedelta
import logging
import yfinance as yf
from dataclasses import dataclass
import warnings
warnings.filterwarnings('ignore')

@dataclass
class DataQuality:
    """Data quality metrics for historical data"""
    ticker: str
    total_days: int
    missing_days: int
    data_completeness: float
    start_date: date
    end_date: date
    has_sufficient_data: bool
    quality_score: float  # 0-1 scale

class ProfessionalHistoricalDataService:
    """
    Professional historical data service for Monte Carlo simulations
    """
    
    def __init__(self, cache_enabled: bool = True):
        self.logger = logging.getLogger(__name__)
        self.cache_enabled = cache_enabled
        self._price_cache = {}
        
        # Data quality thresholds
        self.MIN_COMPLETENESS = 0.95  # 95% data completeness required
        self.MIN_DAYS_1_MONTH = 126   # 6 months for 1-month forecast
        self.MIN_DAYS_3_MONTHS = 252  # 1 year for 3-month forecast  
        self.MIN_DAYS_1_YEAR = 504    # 2 years for 1-year forecast
    
    def get_historical_data(
        self,
        tickers: List[str],
        lookback_days: int = 504,
        end_date: date = None
    ) -> Tuple[pd.DataFrame, Dict[str, DataQuality]]:
        """
        Get historical price data for list of tickers
        
        Args:
            tickers: List of ticker symbols
            lookback_days: Number of business days to look back
            end_date: End date for historical data (default: today)
            
        Returns:
            Tuple of (price_dataframe, data_quality_dict)
        """
        if end_date is None:
            end_date = datetime.now().date()
        
        start_date = self._get_business_date(end_date, -lookback_days)
        
        self.logger.info(f"🔍 Fetching historical data for {len(tickers)} tickers from {start_date} to {end_date}")
        
        # Fetch data for all tickers
        price_data = {}
        data_quality = {}
        
        for ticker in tickers:
            try:
                prices, quality = self._fetch_ticker_data(ticker, start_date, end_date, lookback_days)
                if prices is not None and len(prices) > 0:
                    price_data[ticker] = prices
                    data_quality[ticker] = quality
                    
                    if quality.has_sufficient_data:
                        self.logger.info(f"✅ {ticker}: {quality.total_days} days, {quality.data_completeness:.1%} complete")
                    else:
                        self.logger.warning(f"⚠️ {ticker}: Insufficient data quality (score: {quality.quality_score:.2f})")
                else:
                    self.logger.error(f"❌ {ticker}: No data retrieved")
                    
            except Exception as e:
                self.logger.error(f"❌ Error fetching data for {ticker}: {e}")
                continue
        
        if not price_data:
            self.logger.error("❌ No valid price data retrieved for any ticker")
            return pd.DataFrame(), {}
        
        # Create aligned DataFrame
        price_df = pd.DataFrame(price_data)
        price_df = price_df.sort_index()
        
        # Forward fill missing values (max 5 days)
        price_df = price_df.fillna(method='ffill', limit=5)
        
        self.logger.info(f"✅ Historical data retrieved: {len(price_df)} days x {len(price_df.columns)} assets")
        
        return price_df, data_quality
    
    def _fetch_ticker_data(
        self, 
        ticker: str, 
        start_date: date, 
        end_date: date,
        expected_days: int
    ) -> Tuple[Optional[pd.Series], DataQuality]:
        """Fetch data for a single ticker with quality assessment"""
        
        # Check cache first
        cache_key = f"{ticker}_{start_date}_{end_date}"
        if self.cache_enabled and cache_key in self._price_cache:
            return self._price_cache[cache_key]
        
        try:
            # Use yfinance to get data
            stock = yf.Ticker(ticker)
            hist = stock.history(
                start=start_date, 
                end=end_date + timedelta(days=1),  # Include end date
                interval="1d",
                auto_adjust=True,
                prepost=False
            )
            
            if hist.empty:
                quality = DataQuality(
                    ticker=ticker,
                    total_days=0,
                    missing_days=expected_days,
                    data_completeness=0.0,
                    start_date=start_date,
                    end_date=end_date,
                    has_sufficient_data=False,
                    quality_score=0.0
                )
                return None, quality
            
            # Use adjusted close prices
            prices = hist['Close']
            prices.index = prices.index.date  # Convert to date index
            
            # Calculate data quality metrics
            total_days = len(prices)
            business_days_expected = self._count_business_days(start_date, end_date)
            missing_days = max(0, business_days_expected - total_days)
            completeness = total_days / business_days_expected if business_days_expected > 0 else 0
            
            # Quality assessment
            has_sufficient_data = (
                total_days >= expected_days * 0.8 and  # At least 80% of expected days
                completeness >= self.MIN_COMPLETENESS and  # High completeness
                not self._has_excessive_gaps(prices)  # No large gaps
            )
            
            # Calculate quality score (0-1)
            quality_score = min(1.0, (
                0.4 * min(1.0, total_days / expected_days) +  # Days coverage
                0.4 * completeness +  # Data completeness
                0.2 * (1.0 if not self._has_excessive_gaps(prices) else 0.5)  # Gap penalty
            ))
            
            quality = DataQuality(
                ticker=ticker,
                total_days=total_days,
                missing_days=missing_days,
                data_completeness=completeness,
                start_date=prices.index[0] if len(prices) > 0 else start_date,
                end_date=prices.index[-1] if len(prices) > 0 else end_date,
                has_sufficient_data=has_sufficient_data,
                quality_score=quality_score
            )
            
            # Cache the result
            if self.cache_enabled:
                self._price_cache[cache_key] = (prices, quality)
            
            return prices, quality
            
        except Exception as e:
            self.logger.error(f"Error fetching data for {ticker}: {e}")
            quality = DataQuality(
                ticker=ticker,
                total_days=0,
                missing_days=expected_days,
                data_completeness=0.0,
                start_date=start_date,
                end_date=end_date,
                has_sufficient_data=False,
                quality_score=0.0
            )
            return None, quality
    
    def _get_business_date(self, reference_date: date, business_days_offset: int) -> date:
        """Get business date with specified offset"""
        current_date = reference_date
        days_to_go = abs(business_days_offset)
        direction = -1 if business_days_offset < 0 else 1
        
        while days_to_go > 0:
            current_date += timedelta(days=direction)
            # Skip weekends
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                days_to_go -= 1
        
        return current_date
    
    def _count_business_days(self, start_date: date, end_date: date) -> int:
        """Count business days between two dates"""
        return len(pd.bdate_range(start_date, end_date))
    
    def _has_excessive_gaps(self, prices: pd.Series, max_gap_days: int = 10) -> bool:
        """Check if price series has excessive gaps"""
        if len(prices) < 2:
            return False
        
        # Check for gaps longer than max_gap_days
        dates = pd.to_datetime(prices.index)
        date_diffs = dates.diff().dropna()
        max_gap = date_diffs.max().days
        
        return max_gap > max_gap_days
    
    def get_current_prices(self, tickers: List[str]) -> Dict[str, float]:
        """Get current prices for list of tickers"""
        current_prices = {}
        
        for ticker in tickers:
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                
                # Try different price fields
                price = None
                for field in ['regularMarketPrice', 'currentPrice', 'previousClose']:
                    if field in info and info[field] is not None:
                        price = float(info[field])
                        break
                
                if price is None:
                    # Fallback to recent history
                    hist = stock.history(period="2d")
                    if not hist.empty:
                        price = float(hist['Close'].iloc[-1])
                
                if price is not None:
                    current_prices[ticker] = price
                    self.logger.debug(f"💰 {ticker}: ${price:.2f}")
                else:
                    self.logger.warning(f"⚠️ Could not get current price for {ticker}")
                    
            except Exception as e:
                self.logger.error(f"❌ Error getting current price for {ticker}: {e}")
                continue
        
        self.logger.info(f"✅ Retrieved current prices for {len(current_prices)}/{len(tickers)} tickers")
        return current_prices
    
    def validate_data_quality(
        self, 
        data_quality: Dict[str, DataQuality],
        time_horizon: str
    ) -> Dict[str, bool]:
        """
        Validate if data quality is sufficient for given time horizon
        
        Args:
            data_quality: Data quality metrics for each ticker
            time_horizon: Forecast time horizon
            
        Returns:
            Dictionary indicating if each ticker has sufficient data quality
        """
        min_days_required = {
            "1_month": self.MIN_DAYS_1_MONTH,
            "3_months": self.MIN_DAYS_3_MONTHS,
            "1_year": self.MIN_DAYS_1_YEAR
        }.get(time_horizon, self.MIN_DAYS_3_MONTHS)
        
        validation_results = {}
        
        for ticker, quality in data_quality.items():
            is_valid = (
                quality.total_days >= min_days_required and
                quality.data_completeness >= self.MIN_COMPLETENESS and
                quality.quality_score >= 0.7
            )
            validation_results[ticker] = is_valid
            
            if not is_valid:
                self.logger.warning(
                    f"⚠️ {ticker} data quality insufficient for {time_horizon}: "
                    f"{quality.total_days} days (need {min_days_required}), "
                    f"{quality.data_completeness:.1%} complete (need {self.MIN_COMPLETENESS:.1%})"
                )
        
        return validation_results
    
    def create_fallback_data(
        self, 
        tickers: List[str], 
        lookback_days: int = 504,
        base_price: float = 100.0
    ) -> pd.DataFrame:
        """
        Create synthetic fallback data for testing when real data is unavailable
        WARNING: This should only be used for testing/demonstration purposes
        """
        self.logger.warning("🎭 Creating synthetic fallback data - NOT for production use!")
        
        # Generate business day dates
        end_date = datetime.now().date()
        start_date = self._get_business_date(end_date, -lookback_days)
        dates = pd.bdate_range(start_date, end_date)
        
        np.random.seed(42)  # For reproducible test data
        
        price_data = {}
        for ticker in tickers:
            # Generate realistic synthetic data
            annual_return = np.random.normal(0.08, 0.05)  # 8% ± 5%
            annual_volatility = np.random.uniform(0.15, 0.25)  # 15-25%
            
            daily_return = annual_return / 252
            daily_volatility = annual_volatility / np.sqrt(252)
            
            # Generate correlated returns for realistic behavior
            returns = np.random.normal(daily_return, daily_volatility, len(dates))
            
            # Add some market correlation (all stocks somewhat correlated)
            market_factor = np.random.normal(0, daily_volatility * 0.3, len(dates))
            returns += market_factor
            
            # Generate price series
            prices = [base_price * (1 + np.random.uniform(-0.1, 0.1))]  # Random starting price
            for r in returns[1:]:
                prices.append(prices[-1] * np.exp(r))
            
            price_data[ticker] = prices
        
        df = pd.DataFrame(price_data, index=dates)
        self.logger.info(f"🎭 Created synthetic data: {len(df)} days x {len(df.columns)} assets")
        
        return df

# Utility functions
def get_min_history_days(time_horizon: str) -> int:
    """Get minimum history days required for time horizon"""
    return {
        "1_month": 126,   # 6 months
        "3_months": 252,  # 1 year
        "1_year": 504     # 2 years
    }.get(time_horizon, 252)

def assess_portfolio_data_quality(
    data_quality: Dict[str, DataQuality],
    portfolio_weights: Dict[str, float]
) -> Dict[str, float]:
    """
    Assess overall portfolio data quality
    
    Returns:
        Dictionary with portfolio-level quality metrics
    """
    if not data_quality or not portfolio_weights:
        return {
            'overall_quality_score': 0.0,
            'data_coverage': 0.0,
            'weighted_quality': 0.0
        }
    
    # Calculate weighted quality metrics
    total_weight = sum(portfolio_weights.values())
    weighted_quality = 0.0
    covered_weight = 0.0
    
    for ticker, weight in portfolio_weights.items():
        if ticker in data_quality:
            quality = data_quality[ticker]
            weighted_quality += (weight / total_weight) * quality.quality_score
            covered_weight += weight
    
    data_coverage = covered_weight / total_weight if total_weight > 0 else 0.0
    
    return {
        'overall_quality_score': weighted_quality,
        'data_coverage': data_coverage,
        'weighted_quality': weighted_quality * data_coverage,  # Penalize missing data
        'num_assets_with_data': len([q for q in data_quality.values() if q.has_sufficient_data]),
        'num_total_assets': len(portfolio_weights)
    }