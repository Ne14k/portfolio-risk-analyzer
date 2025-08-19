"""Portfolio Risk Analyzer ML Service"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal
import numpy as np
import pandas as pd
from scipy.optimize import minimize, differential_evolution
import json
import random
from datetime import datetime
import uvicorn
import os
from contextlib import asynccontextmanager

from models.portfolio_models import (
    PortfolioAllocation, ESGPreferences, TaxPreferences, 
    SectorPreferences, PortfolioInput, RiskMetrics, 
    OptimizationResult, AssetClass
)
from models.forecasting_models import ForecastRequest, PortfolioForecast
from models.chatbot_models import ChatRequest, ChatResponse, FeedbackRequest
from services.risk_analyzer import RiskAnalyzer
from services.portfolio_optimizer import PortfolioOptimizer
from services.recommendation_engine import RecommendationEngine
from services.forecasting_service import ForecastingService
from services.chatbot_service import FinancialChatbotService
from utils.market_data import MarketDataProvider
from utils.logger import setup_logger

logger = setup_logger(__name__)

risk_analyzer = None
portfolio_optimizer = None
recommendation_engine = None
forecasting_service = None
chatbot_service = None
market_data_provider = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global risk_analyzer, portfolio_optimizer, recommendation_engine, forecasting_service, chatbot_service, market_data_provider
    
    logger.info("🚀 Starting ML Service initialization...")
    
    market_data_provider = MarketDataProvider()
    await market_data_provider.initialize()
    
    risk_analyzer = RiskAnalyzer(market_data_provider)
    portfolio_optimizer = PortfolioOptimizer(market_data_provider)
    recommendation_engine = RecommendationEngine(market_data_provider)
    forecasting_service = ForecastingService()
    await forecasting_service.initialize()
    
    chatbot_service = FinancialChatbotService()
    await chatbot_service.initialize()
    
    logger.info("✅ ML Service initialization completed")
    yield
    
    logger.info("🔄 Shutting down ML Service...")
    if market_data_provider:
        await market_data_provider.cleanup()
    if forecasting_service:
        await forecasting_service.cleanup()
    if chatbot_service:
        await chatbot_service.cleanup()

app = FastAPI(
    title="Portfolio Risk Analyzer ML Service",
    description="Machine Learning microservice for portfolio optimization and risk analysis",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8080",
        "https://myportfoliotracker.xyz",
        "https://api.myportfoliotracker.xyz"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_services():
    if not all([risk_analyzer, portfolio_optimizer, recommendation_engine, forecasting_service, chatbot_service, market_data_provider]):
        raise HTTPException(
            status_code=503, 
            detail="ML services not initialized. Please wait for startup completion."
        )
    return {
        "risk_analyzer": risk_analyzer,
        "portfolio_optimizer": portfolio_optimizer,
        "recommendation_engine": recommendation_engine,
        "forecasting_service": forecasting_service,
        "chatbot_service": chatbot_service,
        "market_data_provider": market_data_provider
    }

@app.get("/")
async def root():
    return {
        "service": "Portfolio Risk Analyzer ML Service",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    services_status = {}
    
    try:
        services = get_services()
        services_status = {
            "risk_analyzer": "healthy",
            "portfolio_optimizer": "healthy", 
            "recommendation_engine": "healthy",
            "market_data_provider": "healthy"
        }
        overall_status = "healthy"
    except HTTPException:
        services_status = {
            "risk_analyzer": "initializing",
            "portfolio_optimizer": "initializing",
            "recommendation_engine": "initializing", 
            "market_data_provider": "initializing"
        }
        overall_status = "initializing"
    
    return {
        "status": overall_status,
        "services": services_status,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/analyze/risk", response_model=RiskMetrics)
async def analyze_portfolio_risk(
    allocation: PortfolioAllocation,
    services: dict = Depends(get_services)
):
    try:
        logger.info(f"🔍 Analyzing portfolio risk for allocation: {allocation}")
        
        risk_metrics = await services["risk_analyzer"].calculate_portfolio_metrics(allocation)
        
        logger.info(f"✅ Risk analysis completed: {risk_metrics}")
        return risk_metrics
        
    except Exception as e:
        logger.error(f"❌ Error in risk analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Risk analysis failed: {str(e)}"
        )

@app.post("/optimize/portfolio", response_model=OptimizationResult) 
async def optimize_portfolio(
    portfolio: PortfolioInput,
    services: dict = Depends(get_services)
):
    try:
        logger.info(f"🎯 Starting portfolio optimization for: {portfolio.risk_tolerance} risk tolerance")
        
        current_metrics = await services["risk_analyzer"].calculate_portfolio_metrics(portfolio.allocation)
        
        optimized_allocation = await services["portfolio_optimizer"].optimize_portfolio(
            portfolio.allocation,
            portfolio.risk_tolerance,
            portfolio.target_return,
            portfolio.optimization_goal or "sharpe",
            portfolio.esg_preferences,
            portfolio.tax_preferences,
            portfolio.sector_preferences,
            portfolio.use_ai_optimization
        )
        
        optimized_metrics = await services["risk_analyzer"].calculate_portfolio_metrics(optimized_allocation)
        
        recommendations = await services["recommendation_engine"].generate_recommendations(
            portfolio.allocation,
            optimized_allocation,
            current_metrics,
            optimized_metrics,
            portfolio
        )
        
        explanations = await services["recommendation_engine"].generate_explanations(
            current_metrics,
            optimized_metrics,
            portfolio.allocation
        )
        
        result = OptimizationResult(
            optimized_allocation=optimized_allocation,
            current_metrics=current_metrics,
            optimized_metrics=optimized_metrics,
            recommendations=recommendations,
            explanations=explanations
        )
        
        logger.info(f"✅ Portfolio optimization completed successfully")
        return result
        
    except Exception as e:
        logger.error(f"❌ Error in portfolio optimization: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Portfolio optimization failed: {str(e)}"
        )

@app.get("/market-data/asset-classes", response_model=Dict[str, List[AssetClass]])
async def get_asset_classes(services: dict = Depends(get_services)):
    try:
        logger.info("📊 Fetching asset class data")
        
        asset_classes = await services["market_data_provider"].get_asset_classes()
        
        return {"asset_classes": asset_classes}
        
    except Exception as e:
        logger.error(f"❌ Error fetching asset classes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch asset classes: {str(e)}"
        )

@app.post("/analyze/esg-score")
async def calculate_esg_score(
    allocation: PortfolioAllocation,
    esg_preferences: Optional[ESGPreferences] = None,
    services: dict = Depends(get_services)
):
    try:
        logger.info(f"🌱 Calculating ESG score for allocation")
        
        esg_score = await services["recommendation_engine"].calculate_esg_score(
            allocation, esg_preferences
        )
        
        return {
            "esg_score": esg_score,
            "allocation": allocation,
            "preferences": esg_preferences
        }
        
    except Exception as e:
        logger.error(f"❌ Error calculating ESG score: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"ESG score calculation failed: {str(e)}"
        )

@app.post("/analyze/tax-efficiency")
async def calculate_tax_efficiency(
    allocation: PortfolioAllocation,
    tax_preferences: Optional[TaxPreferences] = None,
    services: dict = Depends(get_services)
):
    try:
        logger.info(f"💰 Calculating tax efficiency for allocation")
        
        tax_efficiency = await services["recommendation_engine"].calculate_tax_efficiency(
            allocation, tax_preferences
        )
        
        return {
            "tax_efficiency": tax_efficiency,
            "allocation": allocation,
            "preferences": tax_preferences
        }
        
    except Exception as e:
        logger.error(f"❌ Error calculating tax efficiency: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Tax efficiency calculation failed: {str(e)}"
        )

@app.get("/market-data/correlation-matrix")
async def get_correlation_matrix(services: dict = Depends(get_services)):
    try:
        logger.info("📈 Fetching correlation matrix")
        
        correlation_matrix = await services["market_data_provider"].get_correlation_matrix()
        
        return {
            "correlation_matrix": correlation_matrix.tolist(),
            "asset_order": ["stocks", "bonds", "alternatives", "cash"]
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching correlation matrix: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch correlation matrix: {str(e)}"
        )

@app.post("/forecast/portfolio", response_model=PortfolioForecast)
async def forecast_portfolio(
    request: ForecastRequest,
    services: dict = Depends(get_services)
):
    try:
        logger.info(f"📈 Starting portfolio forecast for {len(request.holdings)} holdings")
        
        forecast_result = await services["forecasting_service"].generate_portfolio_forecast(request)
        
        logger.info("✅ Portfolio forecast completed successfully")
        return forecast_result
        
    except Exception as e:
        logger.error(f"❌ Error in portfolio forecasting: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Portfolio forecasting failed: {str(e)}"
        )

@app.post("/chatbot/chat", response_model=ChatResponse)
async def chat_with_bot(
    request: ChatRequest,
    services: dict = Depends(get_services)
):
    try:
        logger.info(f"🤖 Processing chat request from user: {request.user_id[:8]}...")
        
        response = await services["chatbot_service"].process_chat(request)
        
        logger.info("✅ Chat response generated successfully")
        return response
        
    except Exception as e:
        logger.error(f"❌ Error in chat processing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat processing failed: {str(e)}"
        )

@app.post("/chatbot/feedback")
async def submit_chat_feedback(
    feedback: FeedbackRequest,
    services: dict = Depends(get_services)
):
    try:
        logger.info(f"📝 Processing feedback for session: {feedback.session_id[:8]}...")
        
        await services["chatbot_service"].submit_feedback(feedback)
        
        logger.info("✅ Feedback processed successfully")
        return {"status": "feedback_received", "message": "Thank you for your feedback!"}
        
    except Exception as e:
        logger.error(f"❌ Error processing feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Feedback processing failed: {str(e)}"
        )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    
    logger.info(f"🚀 Starting ML Service on port {port}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False  # Set to True for development
    )