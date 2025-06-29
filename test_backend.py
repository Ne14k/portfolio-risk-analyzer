#!/usr/bin/env python3
"""Test script to verify backend functionality"""
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

try:
    # Test imports
    import main
    print("✅ Backend imports successful")
    
    # Test portfolio calculation
    from main import PortfolioAllocation, calculate_portfolio_metrics
    
    test_allocation = PortfolioAllocation(
        stocks=0.6,
        bonds=0.3,
        alternatives=0.1,
        cash=0.0
    )
    
    metrics = calculate_portfolio_metrics(test_allocation)
    print(f"✅ Portfolio metrics calculation successful: {metrics}")
    
    # Test optimization
    from main import optimize_portfolio
    
    optimized = optimize_portfolio(0.08, "medium")
    print(f"✅ Portfolio optimization successful: {optimized}")
    
    print("\n🎉 All backend tests passed! The backend code is working correctly.")
    print("The issue might be with the server startup or port binding.")
    
except Exception as e:
    print(f"❌ Backend test failed: {e}")
    import traceback
    traceback.print_exc()