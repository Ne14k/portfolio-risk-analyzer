import { supabase } from './supabaseClient';
import { SupabasePortfolioService } from '../services/supabasePortfolio';

/**
 * Setup Supabase database tables for portfolio management
 * Run this once to initialize the database schema
 */
export async function setupSupabaseDatabase(): Promise<void> {
  try {
    console.log('Setting up Supabase database tables...');
    
    // Note: In a real application, you would run this SQL in the Supabase dashboard
    // or use a proper migration system. This is for reference only.
    
    console.log('Database setup instructions:');
    console.log(SupabasePortfolioService.getSetupInstructions());
    
    console.log('The SQL schema file is located at: frontend/database/schema.sql');
    console.log('Copy that file content and run it in your Supabase SQL editor.');
    
    // Test connection
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ Supabase connection successful, user authenticated');
    } else {
      console.log('❌ User not authenticated with Supabase');
    }
    
  } catch (error) {
    console.error('Error setting up Supabase database:', error);
  }
}

/**
 * Migrate existing localStorage data to Supabase
 */
export async function migrateLocalStorageToSupabase(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('User not authenticated, cannot migrate data');
      return;
    }

    // Get existing localStorage data
    const localData = localStorage.getItem('myportfolio_data');
    if (!localData) {
      console.log('No local portfolio data to migrate');
      return;
    }

    const portfolio = JSON.parse(localData);
    console.log(`Migrating ${portfolio.holdings?.length || 0} holdings to Supabase...`);

    // Migrate each holding
    for (const holding of portfolio.holdings || []) {
      try {
        await SupabasePortfolioService.addHolding({
          ticker: holding.ticker,
          name: holding.name,
          quantity: holding.quantity,
          currentPrice: holding.currentPrice,
          category: holding.category
        });
        console.log(`✅ Migrated ${holding.ticker}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${holding.ticker}:`, error);
      }
    }

    console.log('Migration complete! You can now safely clear localStorage data.');
    
  } catch (error) {
    console.error('Error migrating data:', error);
  }
}

/**
 * Check if Supabase is properly configured and accessible
 */
export async function checkSupabaseStatus(): Promise<boolean> {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('portfolios').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('Supabase tables not set up yet or connection failed');
      return false;
    }
    
    console.log('✅ Supabase database is accessible');
    return true;
    
  } catch (error) {
    console.log('❌ Supabase not accessible:', error);
    return false;
  }
}