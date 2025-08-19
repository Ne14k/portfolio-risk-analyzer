"""Portfolio Forecasting Service with Linear Regression"""

import asyncio
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta, date
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import logging

from models.forecasting_models import (
    ForecastRequest, HoldingInfo, AssetForecast, ForecastPoint, 
    PortfolioForecast, PortfolioForecastPoint, ScenarioAnalysis,
    ForecastSummary, ModelMetrics, ConfidenceInterval, HistoricalDataPoint,
    MonteCarloResults
)
from services.historical_data_service import HistoricalDataService
from services.monte_carlo_engine import MonteCarloEngine

logger = logging.getLogger(__name__)

class ForecastingService:
    
    def __init__(self):
        self.historical_data_service = HistoricalDataService()
        self.monte_carlo_engine = MonteCarloEngine()
        self.scaler = StandardScaler()
        
    async def initialize(self):
        """Initialize the forecasting service"""
        await self.historical_data_service.initialize()
        logger.info("✅ Forecasting service initialized")
    
    async def cleanup(self):
        """Clean up resources"""
        await self.historical_data_service.cleanup()
        logger.info("🔄 Forecasting service cleaned up")
    
    async def generate_portfolio_forecast(self, request: ForecastRequest) -> PortfolioForecast:
        """
        Generate comprehensive portfolio forecast
        
        Args:
            request: Forecast request with holdings and parameters
            
        Returns:
            Complete portfolio forecast with individual asset predictions
        """
        try:
            logger.info(f"🎯 Generating portfolio forecast for {len(request.holdings)} holdings")
            
            # Get training period based on time horizon
            training_days = self.historical_data_service.get_training_period_days(request.time_horizon)
            
            # Extract tickers from holdings
            tickers = [holding.ticker for holding in request.holdings]
            
            # Fetch historical data for all tickers
            historical_data = await self.historical_data_service.fetch_multiple_tickers(tickers, training_days)
            
            # Generate forecasts for each asset
            asset_forecasts = []
            total_current_value = sum(holding.market_value for holding in request.holdings)
            
            for holding in request.holdings:
                try:
                    asset_forecast = await self._forecast_individual_asset(
                        holding, historical_data.get(holding.ticker, []), request.time_horizon
                    )
                    asset_forecasts.append(asset_forecast)
                    
                except Exception as e:
                    logger.error(f"❌ Error forecasting {holding.ticker}: {str(e)}")
                    # Create fallback forecast
                    fallback_forecast = self._create_fallback_forecast(holding, request.time_horizon)
                    asset_forecasts.append(fallback_forecast)
            
            # Aggregate individual forecasts into portfolio forecast
            portfolio_forecast_data = self._aggregate_asset_forecasts(asset_forecasts, request.holdings)
            
            # Generate scenarios if requested
            scenarios = None
            if request.include_scenarios:
                scenarios = self._generate_scenarios(portfolio_forecast_data, asset_forecasts)
            
            # Run Monte Carlo simulations if requested
            monte_carlo_results = None
            if request.include_monte_carlo:
                monte_carlo_results = self.monte_carlo_engine.run_monte_carlo_simulation(
                    request.holdings, historical_data, request.time_horizon, request.monte_carlo_simulations
                )
            
            # Create summary with Monte Carlo insights
            summary = self._create_forecast_summary(
                portfolio_forecast_data, total_current_value, request.time_horizon, scenarios, monte_carlo_results
            )
            
            result = PortfolioForecast(
                current_total_value=total_current_value,
                forecast_data=portfolio_forecast_data,
                individual_assets=asset_forecasts,
                scenarios=scenarios,
                monte_carlo_results=monte_carlo_results,
                summary=summary
            )
            
            logger.info("✅ Portfolio forecast generated successfully")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error generating portfolio forecast: {str(e)}")
            raise
    
    async def _forecast_individual_asset(
        self, holding: HoldingInfo, historical_data: List[HistoricalDataPoint], time_horizon: str
    ) -> AssetForecast:
        """Generate forecast for individual asset using linear regression"""
        try:
            logger.info(f"📈 Forecasting {holding.ticker} for {time_horizon}")
            
            if not historical_data or len(historical_data) < 10:
                logger.warning(f"⚠️ Insufficient historical data for {holding.ticker}, using fallback")
                return self._create_fallback_forecast(holding, time_horizon)
            
            # Prepare data for regression
            df = pd.DataFrame([
                {'date': point.date, 'price': point.price} 
                for point in historical_data
            ])
            df['date'] = pd.to_datetime(df['date'])
            df = df.sort_values('date')
            
            # Create features
            df['days_since_start'] = (df['date'] - df['date'].min()).dt.days
            df['moving_avg_7'] = df['price'].rolling(window=7, min_periods=1).mean()
            df['moving_avg_30'] = df['price'].rolling(window=30, min_periods=1).mean()
            df['price_change'] = df['price'].pct_change().fillna(0)
            df['volatility'] = df['price_change'].rolling(window=10, min_periods=1).std().fillna(0)
            
            # Prepare features and target
            feature_columns = ['days_since_start', 'moving_avg_7', 'moving_avg_30', 'volatility']
            X = df[feature_columns].values
            y = df['price'].values
            
            # Train model
            model = LinearRegression()
            model.fit(X, y)
            
            # Calculate model metrics
            y_pred = model.predict(X)
            metrics = ModelMetrics(
                r_squared=r2_score(y, y_pred),
                mse=mean_squared_error(y, y_pred),
                mae=mean_absolute_error(y, y_pred),
                training_period_days=len(historical_data)
            )
            
            # Generate future predictions
            forecast_points = self._generate_forecast_points(
                model, df, holding, time_horizon, feature_columns
            )
            
            # Calculate confidence intervals
            confidence_interval = self._calculate_confidence_interval(
                y, y_pred, len(forecast_points)
            )
            
            return AssetForecast(
                ticker=holding.ticker,
                current_price=holding.current_price,
                forecasted_prices=forecast_points,
                confidence_interval=confidence_interval,
                model_metrics=metrics
            )
            
        except Exception as e:
            logger.error(f"❌ Error in individual asset forecast for {holding.ticker}: {str(e)}")
            return self._create_fallback_forecast(holding, time_horizon)
    
    def _generate_forecast_points(
        self, model: LinearRegression, historical_df: pd.DataFrame, 
        holding: HoldingInfo, time_horizon: str, feature_columns: List[str]
    ) -> List[ForecastPoint]:
        """Generate forecast points for future dates"""
        
        # Determine forecast period
        days_ahead = {
            "1_month": 30,
            "3_months": 90,
            "1_year": 365
        }[time_horizon]
        
        forecast_points = []
        last_date = historical_df['date'].max()
        
        # Use the most recent data as basis for predictions
        latest_data = historical_df.iloc[-1]
        
        for i in range(1, days_ahead + 1):
            future_date = last_date + timedelta(days=i)
            
            # Create features for future date
            future_features = np.array([[
                latest_data['days_since_start'] + i,
                latest_data['moving_avg_7'],  # Use last known moving average
                latest_data['moving_avg_30'],
                latest_data['volatility']
            ]])
            
            # Predict price
            predicted_price = model.predict(future_features)[0]
            
            # Ensure price is positive
            predicted_price = max(predicted_price, 0.01)
            
            # Calculate portfolio value contribution
            portfolio_contribution = predicted_price * holding.quantity
            
            forecast_point = ForecastPoint(
                date=future_date.date(),
                predicted_price=round(predicted_price, 2),
                portfolio_value_contribution=round(portfolio_contribution, 2)
            )
            
            forecast_points.append(forecast_point)
        
        return forecast_points
    
    def _calculate_confidence_interval(self, y_true: np.ndarray, y_pred: np.ndarray, forecast_length: int) -> ConfidenceInterval:
        """Calculate confidence intervals for predictions"""
        
        # Calculate residuals
        residuals = y_true - y_pred
        residual_std = np.std(residuals)
        
        # For simplicity, use constant confidence interval
        # In practice, you might want to use more sophisticated methods
        confidence_multiplier = 1.96  # 95% confidence interval
        
        # Generate confidence bounds
        lower_bound = [-confidence_multiplier * residual_std] * forecast_length
        upper_bound = [confidence_multiplier * residual_std] * forecast_length
        
        return ConfidenceInterval(
            lower_bound=lower_bound,
            upper_bound=upper_bound,
            confidence_level=0.95
        )
    
    def _aggregate_asset_forecasts(
        self, asset_forecasts: List[AssetForecast], holdings: List[HoldingInfo]
    ) -> List[PortfolioForecastPoint]:
        """Aggregate individual asset forecasts into portfolio-level forecast"""
        
        if not asset_forecasts:
            return []
        
        # Get all unique dates from forecasts
        all_dates = set()
        for forecast in asset_forecasts:
            all_dates.update(point.date for point in forecast.forecasted_prices)
        
        sorted_dates = sorted(all_dates)
        
        # Calculate current total value
        current_total = sum(holding.market_value for holding in holdings)
        
        portfolio_points = []
        
        for forecast_date in sorted_dates:
            total_value = 0
            
            # Sum up contributions from all assets for this date
            for asset_forecast in asset_forecasts:
                # Find the forecast point for this date
                date_forecast = next(
                    (point for point in asset_forecast.forecasted_prices if point.date == forecast_date),
                    None
                )
                
                if date_forecast:
                    total_value += date_forecast.portfolio_value_contribution
            
            # Calculate gains/losses
            gain_loss = total_value - current_total
            gain_loss_percentage = (gain_loss / current_total) * 100 if current_total > 0 else 0
            
            portfolio_point = PortfolioForecastPoint(
                date=forecast_date,
                total_value=round(total_value, 2),
                gain_loss=round(gain_loss, 2),
                gain_loss_percentage=round(gain_loss_percentage, 2)
            )
            
            portfolio_points.append(portfolio_point)
        
        return portfolio_points
    
    def _generate_scenarios(
        self, portfolio_forecast: List[PortfolioForecastPoint], asset_forecasts: List[AssetForecast]
    ) -> ScenarioAnalysis:
        """Generate best and worst case scenarios"""
        
        best_case = []
        worst_case = []
        
        for point in portfolio_forecast:
            # Calculate confidence intervals for portfolio value
            total_confidence_adjustment = 0
            
            for asset_forecast in asset_forecasts:
                if asset_forecast.confidence_interval:
                    # Use average confidence interval adjustment
                    avg_upper = np.mean(asset_forecast.confidence_interval.upper_bound)
                    avg_lower = np.mean(asset_forecast.confidence_interval.lower_bound)
                    
                    total_confidence_adjustment += (avg_upper - avg_lower) / 2
            
            # Apply confidence adjustments
            best_case_value = point.total_value + total_confidence_adjustment
            worst_case_value = point.total_value - total_confidence_adjustment
            
            # Ensure values are positive
            best_case_value = max(best_case_value, 0.01)
            worst_case_value = max(worst_case_value, 0.01)
            
            # Calculate gain/loss for scenarios
            current_value = portfolio_forecast[0].total_value - portfolio_forecast[0].gain_loss
            
            best_case.append(PortfolioForecastPoint(
                date=point.date,
                total_value=round(best_case_value, 2),
                gain_loss=round(best_case_value - current_value, 2),
                gain_loss_percentage=round(((best_case_value - current_value) / current_value) * 100, 2)
            ))
            
            worst_case.append(PortfolioForecastPoint(
                date=point.date,
                total_value=round(worst_case_value, 2),
                gain_loss=round(worst_case_value - current_value, 2),
                gain_loss_percentage=round(((worst_case_value - current_value) / current_value) * 100, 2)
            ))
        
        return ScenarioAnalysis(
            best_case=best_case,
            worst_case=worst_case,
            confidence_level=0.95
        )
    
    def _create_forecast_summary(
        self, portfolio_forecast: List[PortfolioForecastPoint], 
        current_value: float, time_horizon: str, scenarios: Optional[ScenarioAnalysis],
        monte_carlo_results: Optional[MonteCarloResults] = None
    ) -> ForecastSummary:
        """Create forecast summary with key metrics"""
        
        if not portfolio_forecast:
            return ForecastSummary(
                time_horizon=time_horizon,
                initial_value=current_value,
                final_projected_value=current_value,
                total_projected_gain=0,
                total_projected_gain_percentage=0,
                annualized_return=0,
                forecast_generated_at=datetime.now()
            )
        
        final_point = portfolio_forecast[-1]
        
        # Calculate annualized return
        days_in_period = {
            "1_month": 30,
            "3_months": 90,
            "1_year": 365
        }[time_horizon]
        
        annualized_return = (
            (final_point.total_value / current_value) ** (365 / days_in_period) - 1
        ) * 100
        
        summary = ForecastSummary(
            time_horizon=time_horizon,
            initial_value=current_value,
            final_projected_value=final_point.total_value,
            total_projected_gain=final_point.gain_loss,
            total_projected_gain_percentage=final_point.gain_loss_percentage,
            annualized_return=round(annualized_return, 2),
            forecast_generated_at=datetime.now()
        )
        
        # Add scenario values if available
        if scenarios:
            summary.best_case_final_value = scenarios.best_case[-1].total_value
            summary.worst_case_final_value = scenarios.worst_case[-1].total_value
        
        # Add Monte Carlo insights if available
        if monte_carlo_results:
            summary.monte_carlo_insights = self.monte_carlo_engine.generate_monte_carlo_insights(
                monte_carlo_results, current_value
            )
        
        return summary
    
    def _create_fallback_forecast(self, holding: HoldingInfo, time_horizon: str) -> AssetForecast:
        """Create a conservative fallback forecast when data is insufficient"""
        
        days_ahead = {
            "1_month": 30,
            "3_months": 90, 
            "1_year": 365
        }[time_horizon]
        
        # Conservative growth assumption (2% annually)
        daily_growth_rate = (1.02 ** (1/365)) - 1
        
        forecast_points = []
        current_price = holding.current_price
        
        for i in range(1, days_ahead + 1):
            future_date = date.today() + timedelta(days=i)
            predicted_price = current_price * ((1 + daily_growth_rate) ** i)
            
            forecast_point = ForecastPoint(
                date=future_date,
                predicted_price=round(predicted_price, 2),
                portfolio_value_contribution=round(predicted_price * holding.quantity, 2)
            )
            
            forecast_points.append(forecast_point)
        
        return AssetForecast(
            ticker=holding.ticker,
            current_price=current_price,
            forecasted_prices=forecast_points,
            confidence_interval=None,
            model_metrics=ModelMetrics(
                r_squared=0.0,
                mse=0.0,
                mae=0.0,
                training_period_days=0
            )
        )