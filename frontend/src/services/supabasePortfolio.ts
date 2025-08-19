import { supabase } from '../utils/supabaseClient';
import { Portfolio, Holding, PortfolioSummary, HoldingFormData, AssetCategory, AssetAllocation } from '../types/portfolio';
import { getStockQuote } from './portfolio';

// Database types that match Supabase schema
export interface SupabaseHolding {
  id: string;
  user_id: string;
  portfolio_id: string;
  ticker: string;
  name: string;
  category: AssetCategory;
  quantity: number;
  current_price: number;
  market_value: number;
  purchase_price: number;
  purchase_date: string;
  total_cost: number;
  unrealized_gain_loss: number;
  unrealized_gain_loss_pct: number;
  beta: number | null;
  volatility: number | null;
  sharpe_ratio: number | null;
  dividend_yield: number;
  portfolio_weight: number;
  exchange: string | null;
  sector: string | null;
  industry: string | null;
  created_at: string;
  updated_at: string;
  last_price_update: string;
}

export interface SupabasePortfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  risk_level: 'conservative' | 'moderate' | 'aggressive';
  total_value: number;
  target_allocation: any;
  rebalance_frequency: number;
  created_at: string;
  updated_at: string;
}

/**
 * Supabase Portfolio Service
 * Handles all portfolio operations with Supabase database
 */
export class SupabasePortfolioService {
  
  /**
   * Test database connection and table existence
   */
  static async testDatabaseConnection(): Promise<{ connected: boolean; tablesExist: boolean; error?: string }> {
    try {
      console.log('🔍 Testing database connection...');
      
      // Test basic connection
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { connected: false, tablesExist: false, error: 'User not authenticated' };
      }
      
      console.log('✅ User authenticated for test:', user.id);
      
      // Test if tables exist
      // Test each table individually
      const tables = ['portfolios', 'holdings', 'portfolio_snapshots', 'rebalancing_history'];
      const missingTables = [];
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true })
          .limit(1);
        
        if (error) {
          console.error(`❌ ${table} table test failed:`, error);
          missingTables.push(table);
        } else {
          console.log(`✅ ${table} table exists`);
        }
      }
      
      if (missingTables.length > 0) {
        return { 
          connected: true, 
          tablesExist: false, 
          error: `Missing tables: ${missingTables.join(', ')}. Please run the database schema.` 
        };
      }
      
      console.log('✅ Database connection and tables test successful');
      return { connected: true, tablesExist: true };
      
    } catch (error) {
      console.error('❌ Database test failed:', error);
      return { connected: false, tablesExist: false, error: (error as Error).message };
    }
  }
  
  /**
   * Instructions for setting up the database schema
   */
  static getSetupInstructions(): string {
    return `
DATABASE SETUP REQUIRED:

To set up the Portfolio Risk Analyzer database:

1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
2. Navigate to SQL Editor
3. Copy and paste the contents of 'frontend/database/schema.sql'
4. Run the script to create all tables, indexes, and functions

The schema includes 4 tables:
- portfolios: User portfolio metadata  
- holdings: Individual stock/ETF/crypto holdings with full analytics data
- portfolio_snapshots: Daily performance tracking
- rebalancing_history: Portfolio rebalancing logs

All tables have Row Level Security enabled for user data isolation.

After running the schema, refresh this page and test the database connection.
`;
  }

  /**
   * Get current user's portfolio
   */
  static async getUserPortfolio(): Promise<Portfolio | null> {
    try {
      console.log('🔍 Getting user portfolio...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated in getUserPortfolio');
        throw new Error('User not authenticated');
      }
      console.log('✅ User authenticated in getUserPortfolio:', user.id);

      // Get or create portfolio
      console.log('📁 Querying portfolios table...');
      let { data: portfolio, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (portfolioError && portfolioError.code !== 'PGRST116') {
        console.error('❌ Error querying portfolios:', portfolioError);
        throw portfolioError;
      }

      if (!portfolio) {
        console.log('📁 No portfolio found, creating default portfolio...');
        // Create default portfolio
        const { data: newPortfolio, error } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            name: 'My Portfolio',
            total_value: 0
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating portfolio:', error);
          throw error;
        }
        
        console.log('✅ Portfolio created successfully:', newPortfolio.id);
        portfolio = newPortfolio;
      } else {
        console.log('✅ Portfolio found:', portfolio.id);
      }

      // Get holdings
      console.log('📁 Querying holdings table...');
      const { data: holdings, error: holdingsError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (holdingsError) {
        console.error('❌ Error querying holdings:', holdingsError);
        throw holdingsError;
      }
      
      console.log('✅ Holdings query successful, found', holdings?.length || 0, 'holdings');

      // Calculate total portfolio value (quantity * market_value for each holding)
      const totalValue = holdings?.reduce((sum, h) => {
        const holdingTotalValue = parseFloat(h.quantity.toString()) * parseFloat(h.market_value.toString());
        return sum + holdingTotalValue;
      }, 0) || 0;
      
      // Convert to frontend format
      const portfolioData: Portfolio = {
        id: portfolio.id,
        name: portfolio.name,
        holdings: holdings?.map(this.convertSupabaseHolding) || [],
        totalValue: totalValue,
        totalGainLoss: 0, // No longer used
        totalGainLossPercentage: 0, // No longer used
        assetAllocation: this.calculateAssetAllocation(holdings || []),
        lastUpdated: portfolio.updated_at
      };

      return portfolioData;
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return null;
    }
  }

  /**
   * Add a new holding
   */
  static async addHolding(holdingData: HoldingFormData): Promise<Holding | null> {
    try {
      console.log('🔄 Adding holding to Supabase:', holdingData);
      
      // Map new categories to existing database enum values
      const categoryMapping: Record<AssetCategory, string> = {
        'stocks': 'stocks',
        'etfs': 'stocks', // Map ETFs to stocks for now until DB is updated
        'crypto': 'crypto',
        'bonds': 'bonds',
        'realEstate': 'realEstate',
        'cash': 'cash',
        'commodities': 'commodities'
      };
      
      const mappedCategory = categoryMapping[holdingData.category];
      
      // Check authentication with detailed logging
      console.log('🔍 Checking user authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Authentication error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        console.error('❌ User not authenticated - user is null');
        throw new Error('User not authenticated');
      }
      
      console.log('✅ User authenticated:', {
        id: user.id,
        email: user.email,
        role: user.role,
        aud: user.aud
      });

      // Get or create portfolio with detailed logging
      console.log('📁 Getting user portfolio...');
      const portfolio = await this.getUserPortfolio();
      if (!portfolio) {
        console.error('❌ Portfolio not found - this should not happen as getUserPortfolio creates one');
        throw new Error('Portfolio not found');
      }
      console.log('✅ Portfolio found:', {
        id: portfolio.id,
        name: portfolio.name,
        holdingsCount: portfolio.holdings?.length || 0
      });

      // Check for existing holding with same ticker
      // We check by ticker only because ETFs might be stored as 'stocks' but displayed as 'etfs'
      console.log('🔍 Checking for existing holding...');
      const { data: existingHoldings, error: existingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('ticker', holdingData.ticker.toUpperCase());

      if (existingError) {
        console.error('❌ Error checking existing holdings:', existingError);
        throw existingError;
      }

      // Filter existing holdings to find one that matches the frontend category
      let matchingHolding = null;
      if (existingHoldings && existingHoldings.length > 0) {
        for (const holding of existingHoldings) {
          const convertedHolding = this.convertSupabaseHolding(holding);
          if (convertedHolding.category === holdingData.category) {
            matchingHolding = holding;
            break;
          }
        }
      }

      if (matchingHolding) {
        // Update existing holding by adding quantities
        const totalQuantity = parseFloat(matchingHolding.quantity.toString()) + holdingData.quantity;
        
        console.log('🔄 CONSOLIDATING DUPLICATE HOLDING IN SUPABASE:', {
          ticker: holdingData.ticker,
          category: holdingData.category,
          dbCategory: matchingHolding.category,
          existingQuantity: matchingHolding.quantity,
          addingQuantity: holdingData.quantity,
          newTotalQuantity: totalQuantity,
          oldPrice: matchingHolding.current_price,
          newPrice: holdingData.currentPrice
        });

        const { data: updatedHolding, error: updateError } = await supabase
          .from('holdings')
          .update({
            quantity: totalQuantity,
            current_price: holdingData.currentPrice, // Use latest price
            market_value: holdingData.currentPrice, // Market value per share = current price
            name: holdingData.name || matchingHolding.name, // Update name if provided
            updated_at: new Date().toISOString()
          })
          .eq('id', matchingHolding.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Error updating existing holding:', updateError);
          throw updateError;
        }

        console.log('✅ SUCCESSFULLY CONSOLIDATED SUPABASE HOLDING:', updatedHolding);
        return this.convertSupabaseHolding(updatedHolding);
      }

      // Create new holding if no existing one found
      const marketValue = holdingData.currentPrice; // Market value per share = current price
      const totalHoldingValue = holdingData.quantity * holdingData.currentPrice; // Total value of all shares
      const totalCost = holdingData.quantity * holdingData.currentPrice;
      
      console.log('💰 Calculating values:', {
        quantity: holdingData.quantity,
        currentPrice: holdingData.currentPrice,
        marketValuePerShare: marketValue,
        totalHoldingValue: totalHoldingValue,
        totalCost: totalCost
      });
      
      const insertData = {
        user_id: user.id,
        portfolio_id: portfolio.id,
        ticker: holdingData.ticker.toUpperCase(),
        name: holdingData.name,
        quantity: holdingData.quantity,
        current_price: holdingData.currentPrice,
        market_value: marketValue,
        category: mappedCategory,
        purchase_price: holdingData.currentPrice, // Use current price as purchase price for new holdings
        purchase_date: new Date().toISOString().split('T')[0], // Today's date
        total_cost: totalCost,
        unrealized_gain_loss: 0.00, // No gain/loss for new holdings
        unrealized_gain_loss_pct: 0.00,
        dividend_yield: 0.00,
        portfolio_weight: 0.00
      };
      
      console.log('📤 Inserting data:', insertData);

      // Test table access first
      console.log('🔍 Testing table access...');
      const { data: testData, error: testError } = await supabase
        .from('holdings')
        .select('count', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (testError) {
        console.error('❌ Table access test failed:', testError);
        throw new Error(`Table access failed: ${testError.message}`);
      }
      
      console.log('✅ Table access successful, existing holdings count:', testData?.length || 0);

      const { data: holding, error } = await supabase
        .from('holdings')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('✅ Holding inserted successfully:', holding);
      console.log('💰 Raw holding from DB:', {
        market_value: holding.market_value,
        quantity: holding.quantity,
        current_price: holding.current_price
      });
      
      const convertedHolding = this.convertSupabaseHolding(holding);
      console.log('🔄 Converted holding:', {
        marketValue: convertedHolding.marketValue,
        quantity: convertedHolding.quantity,
        currentPrice: convertedHolding.currentPrice
      });
      
      return convertedHolding;
    } catch (error) {
      console.error('❌ Error adding holding:', error);
      return null;
    }
  }

  /**
   * Update an existing holding
   */
  static async updateHolding(holdingId: string, updates: Partial<HoldingFormData>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Map new categories to existing database enum values
      const categoryMapping: Record<AssetCategory, string> = {
        'stocks': 'stocks',
        'etfs': 'stocks', // Map ETFs to stocks for now until DB is updated
        'crypto': 'crypto',
        'bonds': 'bonds',
        'realEstate': 'realEstate',
        'cash': 'cash',
        'commodities': 'commodities'
      };

      const updateData: any = {};
      if (updates.ticker) updateData.ticker = updates.ticker.toUpperCase();
      if (updates.name) updateData.name = updates.name;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.currentPrice !== undefined) updateData.current_price = updates.currentPrice;
      if (updates.category) updateData.category = categoryMapping[updates.category];

      const { error } = await supabase
        .from('holdings')
        .update(updateData)
        .eq('id', holdingId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update portfolio total value
      await this.updatePortfolioTotalValue();

      return true;
    } catch (error) {
      console.error('Error updating holding:', error);
      return false;
    }
  }

  /**
   * Remove a holding
   */
  static async removeHolding(holdingId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('holdings')
        .delete()
        .eq('id', holdingId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update portfolio total value
      await this.updatePortfolioTotalValue();

      return true;
    } catch (error) {
      console.error('Error removing holding:', error);
      return false;
    }
  }

  /**
   * Update all holding prices automatically
   */
  static async updateAllHoldingPrices(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: holdings, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      if (!holdings || holdings.length === 0) return;

      console.log('Auto-updating holding prices from Supabase...');

      for (const holding of holdings) {
        try {
          const quote = await getStockQuote(holding.ticker);
          if (quote && quote.price > 0) {
            await supabase
              .from('holdings')
              .update({
                current_price: quote.price,
                updated_at: new Date().toISOString()
              })
              .eq('id', holding.id)
              .eq('user_id', user.id);

            console.log(`Updated ${holding.ticker}: $${quote.price}`);
          }
        } catch (error) {
          console.warn(`Failed to update price for ${holding.ticker}:`, error);
        }

        // Add delay between API calls
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Update portfolio total value
      await this.updatePortfolioTotalValue();
      console.log('Supabase auto-update complete');
    } catch (error) {
      console.error('Error updating holding prices:', error);
    }
  }

  /**
   * Clear all portfolio data
   */
  static async clearPortfolio(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete all holdings first
      await supabase
        .from('holdings')
        .delete()
        .eq('user_id', user.id);

      // Reset portfolio total value
      await supabase
        .from('portfolios')
        .update({ total_value: 0 })
        .eq('user_id', user.id);

      return true;
    } catch (error) {
      console.error('Error clearing portfolio:', error);
      return false;
    }
  }

  /**
   * Get portfolio summary
   */
  static async getPortfolioSummary(): Promise<PortfolioSummary | null> {
    try {
      const portfolio = await this.getUserPortfolio();
      if (!portfolio) return null;

      return {
        totalValue: portfolio.totalValue,
        totalGainLoss: 0, // No longer calculated
        totalGainLossPercentage: 0, // No longer calculated
        holdingsCount: portfolio.holdings.length,
        assetAllocation: portfolio.assetAllocation,
        topHoldings: portfolio.holdings
          .sort((a, b) => b.marketValue - a.marketValue)
          .slice(0, 5),
        lastUpdated: portfolio.lastUpdated,
      };
    } catch (error) {
      console.error('Error getting portfolio summary:', error);
      return null;
    }
  }

  /**
   * Helper: Convert Supabase holding to frontend format
   */
  private static convertSupabaseHolding(holding: SupabaseHolding): Holding {
    // For now, we'll check if this should be an ETF by looking at common ETF patterns
    // This is a temporary solution until the database schema is updated
    let frontendCategory = holding.category;
    if (holding.category === 'stocks') {
      // Comprehensive list of common ETF tickers
      const etfPatterns = [
        // Major Market ETFs
        'SPY', 'VOO', 'IVV', 'VTI', 'QQQ', 'VEA', 'VWO', 'IEFA', 'AGG', 'BND',
        'XLK', 'VGT', 'FTEC', 'IYW', 'SOXX', 'ARKK', 'ARKQ', 'ARKG', 'ARKW', 'ARKF',
        'XLV', 'VHT', 'IHI', 'IBB', 'XBI', 'XLF', 'VFH', 'KBE', 'KRE',
        'XLE', 'VDE', 'XOP', 'USO', 'XLY', 'XLP', 'VCR', 'VDC', 'XLI', 'VIS', 'ITA',
        'VNQ', 'XLRE', 'IYR', 'RWR', 'XLB', 'VAW', 'GDX', 'GDXJ', 'XLU', 'VPU',
        'EFA', 'EEM', 'FXI', 'EWJ', 'EWZ', 'INDA', 'RSX', 'LQD', 'HYG', 'TLT',
        'IEF', 'SHY', 'TIPS', 'MUB', 'VUG', 'IWF', 'SCHG', 'VTV', 'IWD', 'SCHV',
        'IWM', 'VB', 'VTWO', 'VO', 'MDY', 'IJH', 'VYM', 'DVY', 'HDV', 'SCHD', 'NOBL',
        'ESGD', 'ESGU', 'SUSA', 'GLD', 'SLV', 'DBA', 'DBC', 'UUP', 'FXE', 'FXY',
        'VXUS', 'VTEB', 'VGIT', 'VGSH', 'VMOT', 'VIG', 'DGRO', 'ITOT', 'IXUS', 'IEMG',
        'GOVT', 'USIG', 'IGSB', 'IGIB', 'IGLB', 'SWPPX', 'SWTSX', 'SCHB', 'SCHX',
        'SCHA', 'SCHM', 'SCHF', 'SCHE', 'SCHZ'
      ];
      
      const isLikelyETF = etfPatterns.includes(holding.ticker) || 
                         holding.name.toLowerCase().includes('etf') ||
                         holding.name.toLowerCase().includes('fund') ||
                         holding.name.toLowerCase().includes('index') ||
                         (holding.name.toLowerCase().includes('vanguard') && !holding.name.toLowerCase().includes('corp')) ||
                         (holding.name.toLowerCase().includes('ishares')) ||
                         (holding.name.toLowerCase().includes('spdr')) ||
                         (holding.name.toLowerCase().includes('select sector'));
                         
      if (isLikelyETF) {
        frontendCategory = 'etfs';
      }
    }

    return {
      id: holding.id,
      ticker: holding.ticker,
      name: holding.name,
      quantity: parseFloat(holding.quantity.toString()),
      purchasePrice: 0, // Never show purchase price
      currentPrice: parseFloat(holding.current_price.toString()),
      category: frontendCategory as AssetCategory,
      marketValue: parseFloat(holding.market_value.toString()), // This is now per-share market value
      gainLoss: 0, // Never show gains/losses
      gainLossPercentage: 0, // Never show gains/losses
      lastUpdated: holding.updated_at
    };
  }

  /**
   * Helper: Calculate asset allocation from holdings
   */
  private static calculateAssetAllocation(holdings: SupabaseHolding[]): any {
    // Calculate total value using quantity * market_value (which is now per-share price)
    const totalValue = holdings.reduce((sum, h) => {
      const holdingTotalValue = parseFloat(h.quantity.toString()) * parseFloat(h.market_value.toString());
      return sum + holdingTotalValue;
    }, 0);
    
    if (totalValue === 0) {
      return { stocks: 0, etfs: 0, crypto: 0, bonds: 0, realEstate: 0, cash: 0, commodities: 0 };
    }

    return holdings.reduce((acc, holding) => {
      const holdingTotalValue = parseFloat(holding.quantity.toString()) * parseFloat(holding.market_value.toString());
      const percentage = (holdingTotalValue / totalValue) * 100;
      
      // Determine the correct frontend category (same logic as convertSupabaseHolding)
      let frontendCategory = holding.category;
      if (holding.category === 'stocks') {
        // Check if this should be categorized as an ETF
        const etfPatterns = [
          'SPY', 'VOO', 'IVV', 'VTI', 'QQQ', 'VEA', 'VWO', 'IEFA', 'AGG', 'BND',
          'XLK', 'VGT', 'FTEC', 'IYW', 'SOXX', 'ARKK', 'ARKQ', 'ARKG', 'ARKW', 'ARKF',
          'XLV', 'VHT', 'IHI', 'IBB', 'XBI', 'XLF', 'VFH', 'KBE', 'KRE',
          'XLE', 'VDE', 'XOP', 'USO', 'XLY', 'XLP', 'VCR', 'VDC', 'XLI', 'VIS', 'ITA',
          'VNQ', 'XLRE', 'IYR', 'RWR', 'XLB', 'VAW', 'GDX', 'GDXJ', 'XLU', 'VPU',
          'EFA', 'EEM', 'FXI', 'EWJ', 'EWZ', 'INDA', 'RSX', 'LQD', 'HYG', 'TLT',
          'IEF', 'SHY', 'TIPS', 'MUB', 'VUG', 'IWF', 'SCHG', 'VTV', 'IWD', 'SCHV',
          'IWM', 'VB', 'VTWO', 'VO', 'MDY', 'IJH', 'VYM', 'DVY', 'HDV', 'SCHD', 'NOBL',
          'ESGD', 'ESGU', 'SUSA', 'GLD', 'SLV', 'DBA', 'DBC', 'UUP', 'FXE', 'FXY',
          'VXUS', 'VTEB', 'VGIT', 'VGSH', 'VMOT', 'VIG', 'DGRO', 'ITOT', 'IXUS', 'IEMG',
          'GOVT', 'USIG', 'IGSB', 'IGIB', 'IGLB', 'SWPPX', 'SWTSX', 'SCHB', 'SCHX',
          'SCHA', 'SCHM', 'SCHF', 'SCHE', 'SCHZ'
        ];
        
        const isLikelyETF = etfPatterns.includes(holding.ticker) || 
                           holding.name.toLowerCase().includes('etf') ||
                           holding.name.toLowerCase().includes('fund') ||
                           holding.name.toLowerCase().includes('index') ||
                           (holding.name.toLowerCase().includes('vanguard') && !holding.name.toLowerCase().includes('corp')) ||
                           (holding.name.toLowerCase().includes('ishares')) ||
                           (holding.name.toLowerCase().includes('spdr')) ||
                           (holding.name.toLowerCase().includes('select sector'));
                           
        if (isLikelyETF) {
          frontendCategory = 'etfs';
        }
      }
      
      acc[frontendCategory] = (acc[frontendCategory] || 0) + percentage;
      return acc;
    }, {
      stocks: 0,
      etfs: 0,
      crypto: 0,
      bonds: 0,
      realEstate: 0,
      cash: 0,
      commodities: 0,
    } as AssetAllocation);
  }

  /**
   * Helper: Update portfolio total value
   */
  private static async updatePortfolioTotalValue(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: holdings } = await supabase
        .from('holdings')
        .select('market_value')
        .eq('user_id', user.id);

      const totalValue = holdings?.reduce((sum, h) => sum + parseFloat(h.market_value.toString()), 0) || 0;

      await supabase
        .from('portfolios')
        .update({ total_value: totalValue })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating portfolio total value:', error);
    }
  }
}