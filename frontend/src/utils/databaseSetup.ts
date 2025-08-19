import { supabase } from './supabaseClient';

/**
 * Utility to help set up the Portfolio Risk Analyzer database
 */
export class DatabaseSetup {
  
  /**
   * Test if the database tables exist and are accessible
   */
  static async testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Test if portfolios table exists
      const { data, error } = await supabase
        .from('portfolios')
        .select('count', { count: 'exact', head: true });

      if (error) {
        return { 
          success: false, 
          message: 'Database tables not found. Please run the schema.sql script in Supabase SQL Editor.' 
        };
      }

      return { success: true, message: 'Database connection successful!' };
    } catch (error) {
      return { 
        success: false, 
        message: `Database connection failed: ${error}` 
      };
    }
  }

  /**
   * Create a default portfolio for the user if none exists
   */
  static async ensureUserHasPortfolio(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check if user already has a portfolio
      const { data: existingPortfolio } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingPortfolio) {
        return existingPortfolio.id;
      }

      // Create default portfolio
      const { data: newPortfolio, error } = await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          name: 'My Portfolio',
          description: 'My investment portfolio',
          risk_level: 'moderate'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating default portfolio:', error);
        return null;
      }

      return newPortfolio.id;
    } catch (error) {
      console.error('Error ensuring user has portfolio:', error);
      return null;
    }
  }

  /**
   * Get setup status and instructions
   */
  static async getSetupStatus(): Promise<{
    isSetup: boolean;
    hasPortfolio: boolean;
    instructions: string;
  }> {
    const connectionTest = await this.testDatabaseConnection();
    
    if (!connectionTest.success) {
      return {
        isSetup: false,
        hasPortfolio: false,
        instructions: `
🔧 Database Setup Required

1. Copy the SQL from: frontend/database/schema.sql
2. Go to your Supabase Dashboard → SQL Editor  
3. Paste and run the SQL script
4. Refresh this page

This will create all necessary tables for portfolio tracking, analysis, and forecasting.
        `
      };
    }

    const portfolioId = await this.ensureUserHasPortfolio();
    
    return {
      isSetup: true,
      hasPortfolio: !!portfolioId,
      instructions: portfolioId 
        ? '✅ Database setup complete! You can now add holdings to your portfolio.'
        : '⚠️ Portfolio creation failed. Please check your database permissions.'
    };
  }

  /**
   * Display setup instructions in console
   */
  static logSetupInstructions(): void {
    console.log(`
🚀 Portfolio Risk Analyzer Database Setup

1. Copy the contents of: frontend/database/schema.sql
2. Go to Supabase Dashboard → SQL Editor
3. Paste and execute the SQL script

This creates tables for:
- User portfolios with metadata
- Holdings with full analytics data (quantity up to 6 decimals)
- Price history for backtesting  
- Portfolio snapshots for performance tracking
- Market benchmarks for comparison

🔒 All tables have Row Level Security for user data isolation
📊 Ready for forecasting, simulation, and portfolio analysis
    `);
  }
}

// Auto-run setup check when module loads
DatabaseSetup.getSetupStatus().then(status => {
  if (!status.isSetup) {
    DatabaseSetup.logSetupInstructions();
  }
});

export default DatabaseSetup;