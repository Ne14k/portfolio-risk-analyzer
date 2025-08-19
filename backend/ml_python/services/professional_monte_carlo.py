"""
Professional Monte Carlo Simulation Engine for Portfolio Forecasting
Built for production use with real financial mathematics
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Tuple, Optional, Union
from datetime import datetime, date, timedelta
from scipy import stats
from scipy.optimize import minimize
import logging
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor
import warnings
warnings.filterwarnings('ignore')

@dataclass
class AssetParameters:
    """Statistical parameters for each asset"""
    ticker: str
    current_price: float
    daily_mean_return: float
    daily_volatility: float
    drift: float  # Risk-adjusted drift
    sharpe_ratio: float
    skewness: float
    kurtosis: float
    lookback_days: int

@dataclass
class SimulationConfig:
    """Configuration for Monte Carlo simulation"""
    num_simulations: int = 10000
    time_horizon_days: int = 252
    confidence_levels: List[float] = None
    risk_free_rate: float = 0.02  # Annual risk-free rate
    use_antithetic_variates: bool = True
    parallelize: bool = True
    max_workers: int = 4

    def __post_init__(self):
        if self.confidence_levels is None:
            self.confidence_levels = [0.01, 0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95, 0.99]

class ProfessionalMonteCarloEngine:
    """
    Production-grade Monte Carlo simulation engine for portfolio forecasting
    """
    
    def __init__(self, config: SimulationConfig):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Trading calendar constants
        self.TRADING_DAYS_PER_YEAR = 252
        self.TRADING_DAYS_PER_MONTH = 21
        self.TRADING_DAYS_PER_QUARTER = 63
        
    def calculate_asset_parameters(
        self, 
        historical_prices: pd.DataFrame, 
        current_prices: Dict[str, float],
        min_history_days: int = 252
    ) -> Dict[str, AssetParameters]:
        """
        Calculate statistically robust parameters for each asset
        
        Args:
            historical_prices: DataFrame with columns = tickers, index = dates
            current_prices: Dictionary of current prices for each ticker
            min_history_days: Minimum number of historical days required
            
        Returns:
            Dictionary of asset parameters for each ticker
        """
        parameters = {}
        
        for ticker in historical_prices.columns:
            try:
                # Get price series and remove NaN values
                price_series = historical_prices[ticker].dropna()
                
                if len(price_series) < min_history_days:
                    self.logger.warning(f"Insufficient data for {ticker}: {len(price_series)} days")
                    # Use market defaults for insufficient data
                    parameters[ticker] = self._get_default_parameters(
                        ticker, current_prices.get(ticker, price_series.iloc[-1])
                    )
                    continue
                
                # Calculate log returns
                log_returns = np.log(price_series / price_series.shift(1)).dropna()
                
                # Basic statistics
                daily_mean_return = log_returns.mean()
                daily_volatility = log_returns.std()
                
                # Risk-adjusted drift (subtract half variance for log-normal adjustment)
                drift = daily_mean_return - 0.5 * (daily_volatility ** 2)
                
                # Higher moment statistics
                skewness = stats.skew(log_returns)
                kurtosis = stats.kurtosis(log_returns)
                
                # Risk metrics
                daily_rf_rate = (1 + self.config.risk_free_rate) ** (1/self.TRADING_DAYS_PER_YEAR) - 1
                excess_returns = log_returns - daily_rf_rate
                sharpe_ratio = excess_returns.mean() / log_returns.std() if log_returns.std() > 0 else 0
                
                parameters[ticker] = AssetParameters(
                    ticker=ticker,
                    current_price=current_prices.get(ticker, price_series.iloc[-1]),
                    daily_mean_return=daily_mean_return,
                    daily_volatility=daily_volatility,
                    drift=drift,
                    sharpe_ratio=sharpe_ratio,
                    skewness=skewness,
                    kurtosis=kurtosis,
                    lookback_days=len(log_returns)
                )
                
                self.logger.info(f"✅ {ticker}: μ={daily_mean_return:.4f}, σ={daily_volatility:.4f}, "
                               f"Sharpe={sharpe_ratio:.3f}, n={len(log_returns)}")
                
            except Exception as e:
                self.logger.error(f"❌ Error calculating parameters for {ticker}: {e}")
                parameters[ticker] = self._get_default_parameters(
                    ticker, current_prices.get(ticker, 100.0)
                )
        
        return parameters
    
    def _get_default_parameters(self, ticker: str, current_price: float) -> AssetParameters:
        """Get default parameters for assets with insufficient data"""
        # Use broad market assumptions
        annual_return = 0.08  # 8% annual return assumption
        annual_volatility = 0.16  # 16% annual volatility assumption
        
        daily_mean_return = annual_return / self.TRADING_DAYS_PER_YEAR
        daily_volatility = annual_volatility / np.sqrt(self.TRADING_DAYS_PER_YEAR)
        drift = daily_mean_return - 0.5 * (daily_volatility ** 2)
        
        return AssetParameters(
            ticker=ticker,
            current_price=current_price,
            daily_mean_return=daily_mean_return,
            daily_volatility=daily_volatility,
            drift=drift,
            sharpe_ratio=0.5,  # Moderate Sharpe ratio
            skewness=-0.1,     # Slight negative skew
            kurtosis=3.0,      # Normal kurtosis
            lookback_days=0    # No historical data
        )
    
    def calculate_correlation_matrix(
        self, 
        historical_prices: pd.DataFrame,
        method: str = 'pearson'
    ) -> np.ndarray:
        """
        Calculate correlation matrix from historical returns
        
        Args:
            historical_prices: DataFrame with asset prices
            method: Correlation method ('pearson', 'spearman', 'kendall')
            
        Returns:
            Correlation matrix as numpy array
        """
        # Calculate log returns
        log_returns = np.log(historical_prices / historical_prices.shift(1)).dropna()
        
        # Calculate correlation matrix
        if method == 'pearson':
            corr_matrix = log_returns.corr().values
        elif method == 'spearman':
            corr_matrix = log_returns.corr(method='spearman').values
        elif method == 'kendall':
            corr_matrix = log_returns.corr(method='kendall').values
        else:
            raise ValueError(f"Unsupported correlation method: {method}")
        
        # Handle NaN values with identity matrix
        if np.isnan(corr_matrix).any():
            self.logger.warning("NaN values found in correlation matrix, using identity matrix")
            corr_matrix = np.eye(len(historical_prices.columns))
        
        # Ensure positive semi-definite matrix
        corr_matrix = self._make_positive_semidefinite(corr_matrix)
        
        return corr_matrix
    
    def _make_positive_semidefinite(self, matrix: np.ndarray) -> np.ndarray:
        """Make correlation matrix positive semi-definite"""
        eigenvals, eigenvecs = np.linalg.eigh(matrix)
        eigenvals = np.maximum(eigenvals, 1e-8)  # Set minimum eigenvalue
        return eigenvecs @ np.diag(eigenvals) @ eigenvecs.T
    
    def run_monte_carlo_simulation(
        self,
        asset_parameters: Dict[str, AssetParameters],
        portfolio_weights: Dict[str, float],
        correlation_matrix: np.ndarray,
        time_horizon_days: int = None
    ) -> Dict[str, Union[np.ndarray, Dict]]:
        """
        Run Monte Carlo simulation with proper financial mathematics
        
        Args:
            asset_parameters: Parameters for each asset
            portfolio_weights: Portfolio weights for each asset
            correlation_matrix: Asset correlation matrix
            time_horizon_days: Number of trading days to simulate
            
        Returns:
            Dictionary containing simulation results and statistics
        """
        if time_horizon_days is None:
            time_horizon_days = self.config.time_horizon_days
            
        # Setup simulation
        tickers = list(asset_parameters.keys())
        n_assets = len(tickers)
        n_sims = self.config.num_simulations
        
        # Use antithetic variates for variance reduction
        if self.config.use_antithetic_variates:
            n_base_sims = n_sims // 2
        else:
            n_base_sims = n_sims
        
        # Calculate initial portfolio value
        initial_portfolio_value = sum(
            asset_parameters[ticker].current_price * portfolio_weights.get(ticker, 0)
            for ticker in tickers
        )
        
        if self.config.parallelize:
            results = self._run_parallel_simulation(
                asset_parameters, portfolio_weights, correlation_matrix, 
                time_horizon_days, n_base_sims, tickers
            )
        else:
            results = self._run_sequential_simulation(
                asset_parameters, portfolio_weights, correlation_matrix,
                time_horizon_days, n_base_sims, tickers
            )
        
        # Calculate comprehensive statistics
        statistics = self._calculate_simulation_statistics(
            results, initial_portfolio_value, time_horizon_days
        )
        
        return {
            'portfolio_paths': results,
            'statistics': statistics,
            'initial_value': initial_portfolio_value,
            'time_horizon_days': time_horizon_days,
            'simulation_config': self.config
        }
    
    def _run_parallel_simulation(
        self, 
        asset_parameters: Dict[str, AssetParameters],
        portfolio_weights: Dict[str, float],
        correlation_matrix: np.ndarray,
        time_horizon_days: int,
        n_base_sims: int,
        tickers: List[str]
    ) -> np.ndarray:
        """Run simulation in parallel for better performance"""
        
        def simulate_batch(batch_size: int) -> np.ndarray:
            return self._simulate_portfolio_paths(
                asset_parameters, portfolio_weights, correlation_matrix,
                time_horizon_days, batch_size, tickers
            )
        
        # Divide simulations into batches
        batch_size = max(1, n_base_sims // self.config.max_workers)
        batches = [batch_size] * (n_base_sims // batch_size)
        if n_base_sims % batch_size > 0:
            batches.append(n_base_sims % batch_size)
        
        # Run parallel simulation
        with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            batch_results = list(executor.map(simulate_batch, batches))
        
        # Combine results
        results = np.concatenate(batch_results, axis=0)
        
        # Apply antithetic variates
        if self.config.use_antithetic_variates:
            antithetic_results = 2 * results[0:1, :] - results  # Reflect around initial value
            results = np.concatenate([results, antithetic_results], axis=0)
        
        return results
    
    def _run_sequential_simulation(
        self,
        asset_parameters: Dict[str, AssetParameters],
        portfolio_weights: Dict[str, float], 
        correlation_matrix: np.ndarray,
        time_horizon_days: int,
        n_base_sims: int,
        tickers: List[str]
    ) -> np.ndarray:
        """Run simulation sequentially"""
        results = self._simulate_portfolio_paths(
            asset_parameters, portfolio_weights, correlation_matrix,
            time_horizon_days, n_base_sims, tickers
        )
        
        # Apply antithetic variates
        if self.config.use_antithetic_variates:
            antithetic_results = 2 * results[0:1, :] - results
            results = np.concatenate([results, antithetic_results], axis=0)
        
        return results
    
    def _simulate_portfolio_paths(
        self,
        asset_parameters: Dict[str, AssetParameters],
        portfolio_weights: Dict[str, float],
        correlation_matrix: np.ndarray,
        time_horizon_days: int,
        n_sims: int,
        tickers: List[str]
    ) -> np.ndarray:
        """Core simulation logic using geometric Brownian motion"""
        
        n_assets = len(tickers)
        
        # Initialize portfolio value array
        portfolio_values = np.zeros((n_sims, time_horizon_days + 1))
        
        # Set initial portfolio value
        initial_value = sum(
            asset_parameters[ticker].current_price * portfolio_weights.get(ticker, 0)
            for ticker in tickers
        )
        portfolio_values[:, 0] = initial_value
        
        # Generate correlated random shocks using Cholesky decomposition
        np.random.seed(42)  # For reproducibility in testing
        L = np.linalg.cholesky(correlation_matrix)
        
        # Pre-generate all random numbers for efficiency
        Z = np.random.standard_normal((n_sims, time_horizon_days, n_assets))
        correlated_Z = np.einsum('ijk,lk->ijl', Z, L)
        
        # Initialize asset price arrays
        asset_prices = np.zeros((n_sims, time_horizon_days + 1, n_assets))
        for i, ticker in enumerate(tickers):
            asset_prices[:, 0, i] = asset_parameters[ticker].current_price
        
        # Simulate price paths using geometric Brownian motion
        for day in range(1, time_horizon_days + 1):
            for i, ticker in enumerate(tickers):
                params = asset_parameters[ticker]
                
                # Geometric Brownian Motion: dS = S * (μ*dt + σ*dW)
                # For discrete time: S_t = S_{t-1} * exp((μ - σ²/2)*dt + σ*sqrt(dt)*Z)
                drift_term = params.drift
                shock_term = params.daily_volatility * correlated_Z[:, day-1, i]
                
                # Calculate new prices
                log_return = drift_term + shock_term
                asset_prices[:, day, i] = asset_prices[:, day-1, i] * np.exp(log_return)
            
            # Calculate portfolio values for this day
            for i, ticker in enumerate(tickers):
                weight = portfolio_weights.get(ticker, 0)
                if weight > 0:
                    portfolio_values[:, day] += weight * asset_prices[:, day, i]
        
        return portfolio_values
    
    def _calculate_simulation_statistics(
        self, 
        portfolio_paths: np.ndarray, 
        initial_value: float,
        time_horizon_days: int
    ) -> Dict:
        """Calculate comprehensive statistics from simulation results"""
        
        final_values = portfolio_paths[:, -1]
        returns = (final_values - initial_value) / initial_value
        
        # Basic statistics
        stats_dict = {
            'mean_final_value': float(np.mean(final_values)),
            'median_final_value': float(np.median(final_values)),
            'std_final_value': float(np.std(final_values)),
            'mean_return': float(np.mean(returns)),
            'median_return': float(np.median(returns)),
            'std_return': float(np.std(returns)),
            'min_return': float(np.min(returns)),
            'max_return': float(np.max(returns))
        }
        
        # Percentiles
        percentiles = {}
        for conf_level in self.config.confidence_levels:
            percentile_val = conf_level * 100
            percentiles[f'percentile_{percentile_val:g}'] = float(
                np.percentile(final_values, percentile_val)
            )
        stats_dict['percentiles'] = percentiles
        
        # Time series percentiles for charting
        time_series_percentiles = {}
        for conf_level in [0.05, 0.25, 0.50, 0.75, 0.95]:
            percentile_val = conf_level * 100
            time_series_percentiles[f'percentile_{percentile_val:g}'] = [
                float(np.percentile(portfolio_paths[:, day], percentile_val))
                for day in range(portfolio_paths.shape[1])
            ]
        stats_dict['time_series_percentiles'] = time_series_percentiles
        
        # Risk metrics
        daily_rf_rate = (1 + self.config.risk_free_rate) ** (1/self.TRADING_DAYS_PER_YEAR) - 1
        annualized_rf_rate = (1 + daily_rf_rate) ** time_horizon_days - 1
        
        excess_returns = returns - annualized_rf_rate
        sharpe_ratio = np.mean(excess_returns) / np.std(returns) if np.std(returns) > 0 else 0
        
        # Value at Risk and Expected Shortfall
        var_95 = float(np.percentile(final_values, 5))
        var_99 = float(np.percentile(final_values, 1))
        
        # Expected Shortfall (Conditional VaR)
        es_95 = float(np.mean(final_values[final_values <= var_95]))
        es_99 = float(np.mean(final_values[final_values <= var_99]))
        
        # Probability metrics
        prob_positive = float(np.mean(returns > 0))
        prob_loss_5 = float(np.mean(returns <= -0.05))
        prob_loss_10 = float(np.mean(returns <= -0.10))
        prob_gain_10 = float(np.mean(returns >= 0.10))
        prob_gain_20 = float(np.mean(returns >= 0.20))
        
        # Higher moments
        skewness = float(stats.skew(returns))
        kurtosis = float(stats.kurtosis(returns))
        
        # Maximum Drawdown calculation
        portfolio_returns = np.diff(portfolio_paths, axis=1) / portfolio_paths[:, :-1]
        portfolio_cumulative = np.cumprod(1 + portfolio_returns, axis=1)
        portfolio_cumulative = np.column_stack([np.ones(portfolio_cumulative.shape[0]), portfolio_cumulative])
        
        running_max = np.maximum.accumulate(portfolio_cumulative, axis=1)
        drawdowns = (portfolio_cumulative - running_max) / running_max
        max_drawdown = float(np.min(drawdowns))
        
        # Downside statistics
        downside_returns = returns[returns < 0]
        downside_deviation = float(np.std(downside_returns)) if len(downside_returns) > 0 else 0.0
        
        # Advanced ratios
        sortino_ratio = np.mean(excess_returns) / downside_deviation if downside_deviation > 0 else 0
        calmar_ratio = np.mean(returns) / abs(max_drawdown) if max_drawdown < 0 else 0
        
        stats_dict.update({
            'sharpe_ratio': float(sharpe_ratio),
            'sortino_ratio': float(sortino_ratio),
            'calmar_ratio': float(calmar_ratio),
            'var_95': var_95,
            'var_99': var_99,
            'expected_shortfall_95': es_95,
            'expected_shortfall_99': es_99,
            'probability_positive': prob_positive,
            'probability_loss_5_percent': prob_loss_5,
            'probability_loss_10_percent': prob_loss_10,
            'probability_gain_10_percent': prob_gain_10,
            'probability_gain_20_percent': prob_gain_20,
            'skewness': skewness,
            'kurtosis': kurtosis,
            'maximum_drawdown': max_drawdown,
            'downside_deviation': downside_deviation
        })
        
        return stats_dict

# Usage utilities
def get_trading_days_for_horizon(time_horizon: str) -> int:
    """Get trading days for different time horizons"""
    mapping = {
        "1_month": 21,
        "3_months": 63, 
        "1_year": 252
    }
    return mapping.get(time_horizon, 63)

def create_simulation_config(time_horizon: str, num_simulations: int = 10000) -> SimulationConfig:
    """Create optimized simulation configuration"""
    trading_days = get_trading_days_for_horizon(time_horizon)
    
    return SimulationConfig(
        num_simulations=num_simulations,
        time_horizon_days=trading_days,
        use_antithetic_variates=True,
        parallelize=True,
        max_workers=4
    )

def create_sample_portfolio_weights(holdings: List[Dict]) -> Dict[str, float]:
    """Convert holdings list to portfolio weights dictionary"""
    total_value = sum(h.get('market_value', h.get('quantity', 0) * h.get('current_price', 0)) for h in holdings)
    
    if total_value == 0:
        return {}
    
    weights = {}
    for holding in holdings:
        ticker = holding.get('ticker', holding.get('symbol', ''))
        market_value = holding.get('market_value', holding.get('quantity', 0) * holding.get('current_price', 0))
        weights[ticker] = market_value / total_value
    
    return weights

def generate_sample_historical_data(tickers: List[str], days: int = 504) -> pd.DataFrame:
    """Generate sample historical data for testing (replace with real data source)"""
    np.random.seed(42)
    dates = pd.date_range(end=datetime.now().date(), periods=days, freq='B')  # Business days
    
    data = {}
    for ticker in tickers:
        # Generate realistic price series using geometric Brownian motion
        annual_return = np.random.normal(0.08, 0.05)  # Random annual return around 8%
        annual_volatility = np.random.uniform(0.12, 0.25)  # Random volatility 12-25%
        
        daily_return = annual_return / 252
        daily_volatility = annual_volatility / np.sqrt(252)
        
        returns = np.random.normal(daily_return, daily_volatility, days)
        initial_price = np.random.uniform(50, 200)  # Random starting price
        
        # Generate price series
        prices = [initial_price]
        for r in returns[1:]:
            prices.append(prices[-1] * np.exp(r))
        
        data[ticker] = prices
    
    return pd.DataFrame(data, index=dates)