-- Portfolio Risk Analyzer Database Schema
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity (skip if already exists)
DO $$ BEGIN
    CREATE TYPE asset_category AS ENUM ('stocks', 'bonds', 'realEstate', 'cash', 'crypto', 'commodities');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('conservative', 'moderate', 'aggressive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table is automatically created by Supabase Auth
-- We'll reference auth.users(id) for user relationships

-- 1. PORTFOLIOS TABLE
-- Stores user portfolio metadata
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL DEFAULT 'My Portfolio',
    description TEXT,
    risk_level risk_level DEFAULT 'moderate',
    total_value DECIMAL(15,2) DEFAULT 0.00,
    target_allocation JSONB DEFAULT '{}', -- Store target allocation percentages
    rebalance_frequency INTEGER DEFAULT 90, -- Days between rebalancing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT portfolios_user_name_unique UNIQUE(user_id, name)
);

-- 2. HOLDINGS TABLE  
-- Stores individual holdings with all data needed for analysis
CREATE TABLE IF NOT EXISTS holdings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
    
    -- Basic holding information
    ticker TEXT NOT NULL,
    name TEXT NOT NULL,
    category asset_category NOT NULL,
    
    -- Quantity and pricing (current state)
    quantity DECIMAL(15,6) NOT NULL CHECK (quantity >= 0), -- Up to 6 decimal places
    current_price DECIMAL(15,2) NOT NULL CHECK (current_price >= 0),
    market_value DECIMAL(15,2) DEFAULT 0.00,
    
    -- Purchase information (for analysis)
    purchase_price DECIMAL(15,2) DEFAULT 0.00, -- Average cost basis
    purchase_date DATE DEFAULT CURRENT_DATE,
    total_cost DECIMAL(15,2) DEFAULT 0.00,
    
    -- Performance metrics (calculated via functions, not generated columns)
    unrealized_gain_loss DECIMAL(15,2) DEFAULT 0.00,
    unrealized_gain_loss_pct DECIMAL(8,4) DEFAULT 0.00,
    
    -- Risk metrics (to be populated by analysis)
    beta DECIMAL(8,4) DEFAULT NULL, -- Stock volatility vs market
    volatility DECIMAL(8,4) DEFAULT NULL, -- 30-day volatility
    sharpe_ratio DECIMAL(8,4) DEFAULT NULL, -- Risk-adjusted return
    
    -- Dividend information
    dividend_yield DECIMAL(8,4) DEFAULT 0.00, -- Annual dividend yield %
    last_dividend_date DATE DEFAULT NULL,
    
    -- Portfolio weight
    portfolio_weight DECIMAL(8,4) DEFAULT 0.00, -- Percentage of total portfolio
    
    -- Exchange and sector information for analysis
    exchange TEXT DEFAULT NULL,
    sector TEXT DEFAULT NULL,
    industry TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_price_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT holdings_user_portfolio_ticker_unique UNIQUE(user_id, portfolio_id, ticker)
);

-- Removed: price_history table (not needed for current functionality)

-- 4. PORTFOLIO SNAPSHOTS TABLE
-- Stores daily portfolio performance for tracking
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
    
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_value DECIMAL(15,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    total_gain_loss DECIMAL(15,2) NOT NULL,
    total_gain_loss_pct DECIMAL(8,4) NOT NULL,
    
    -- Asset allocation snapshot
    allocation_stocks DECIMAL(8,4) DEFAULT 0,
    allocation_bonds DECIMAL(8,4) DEFAULT 0,
    allocation_real_estate DECIMAL(8,4) DEFAULT 0,
    allocation_cash DECIMAL(8,4) DEFAULT 0,
    allocation_crypto DECIMAL(8,4) DEFAULT 0,
    allocation_commodities DECIMAL(8,4) DEFAULT 0,
    
    -- Risk metrics
    portfolio_beta DECIMAL(8,4) DEFAULT NULL,
    portfolio_volatility DECIMAL(8,4) DEFAULT NULL,
    portfolio_sharpe_ratio DECIMAL(8,4) DEFAULT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT portfolio_snapshots_user_portfolio_date_unique UNIQUE(user_id, portfolio_id, snapshot_date)
);

-- 5. REBALANCING HISTORY TABLE
-- Tracks portfolio rebalancing activities
CREATE TABLE IF NOT EXISTS rebalancing_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
    
    rebalance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT NOT NULL, -- 'scheduled', 'manual', 'drift_threshold'
    
    -- Before rebalancing
    total_value_before DECIMAL(15,2) NOT NULL,
    allocation_before JSONB NOT NULL,
    
    -- After rebalancing  
    total_value_after DECIMAL(15,2) NOT NULL,
    allocation_after JSONB NOT NULL,
    
    -- Transaction costs
    transaction_costs DECIMAL(15,2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Removed: market_indices table (not needed for current functionality)

-- CREATE INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_user_id ON holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON holdings(ticker);
CREATE INDEX IF NOT EXISTS idx_holdings_category ON holdings(category);
CREATE INDEX IF NOT EXISTS idx_holdings_updated_at ON holdings(updated_at);
-- Removed: price_history indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_portfolio ON portfolio_snapshots(user_id, portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_snapshots(snapshot_date);
-- Removed: market_indices indexes

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebalancing_history ENABLE ROW LEVEL SECURITY;

-- Note: Removed price_history and market_indices tables

-- RLS POLICIES for portfolios
CREATE POLICY "Users can manage their own portfolios" ON portfolios
    FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES for holdings  
CREATE POLICY "Users can manage their own holdings" ON holdings
    FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES for portfolio_snapshots
CREATE POLICY "Users can manage their own portfolio snapshots" ON portfolio_snapshots
    FOR ALL USING (auth.uid() = user_id);

-- RLS POLICIES for rebalancing_history
CREATE POLICY "Users can manage their own rebalancing history" ON rebalancing_history
    FOR ALL USING (auth.uid() = user_id);

-- CREATE FUNCTIONS for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- CREATE TRIGGERS for auto-updating timestamps
CREATE TRIGGER update_portfolios_updated_at 
    BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at 
    BEFORE UPDATE ON holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTION to calculate portfolio allocation
CREATE OR REPLACE FUNCTION calculate_portfolio_allocation(p_portfolio_id UUID)
RETURNS JSONB AS $$
DECLARE
    total_value DECIMAL(15,2);
    allocation JSONB := '{}';
BEGIN
    -- Get total portfolio value
    SELECT SUM(market_value) INTO total_value
    FROM holdings 
    WHERE portfolio_id = p_portfolio_id;
    
    IF total_value > 0 THEN
        -- Calculate allocation by category
        SELECT jsonb_object_agg(
            category::text, 
            ROUND((SUM(market_value) / total_value * 100)::numeric, 2)
        ) INTO allocation
        FROM holdings 
        WHERE portfolio_id = p_portfolio_id
        GROUP BY category;
    END IF;
    
    RETURN COALESCE(allocation, '{}');
END;
$$ LANGUAGE plpgsql;

-- FUNCTION to update portfolio weights
CREATE OR REPLACE FUNCTION update_portfolio_weights(p_portfolio_id UUID)
RETURNS VOID AS $$
DECLARE
    total_value DECIMAL(15,2);
BEGIN
    -- Get total portfolio value
    SELECT SUM(market_value) INTO total_value
    FROM holdings 
    WHERE portfolio_id = p_portfolio_id;
    
    -- Update individual holding weights
    IF total_value > 0 THEN
        UPDATE holdings 
        SET portfolio_weight = ROUND((market_value / total_value * 100)::numeric, 4)
        WHERE portfolio_id = p_portfolio_id;
    END IF;
    
    -- Update portfolio total value
    UPDATE portfolios 
    SET total_value = total_value
    WHERE id = p_portfolio_id;
END;
$$ LANGUAGE plpgsql;

-- Removed: calculate_holding_performance function and trigger (causing recursion)

-- Removed: trigger_update_portfolio_weights function and trigger (causing recursion)

-- Removed: market indices sample data

-- Success message
SELECT 'Portfolio Risk Analyzer database schema created successfully!' as status;