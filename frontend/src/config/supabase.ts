import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://cvbszdvgvdvbykpsgfvw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2YnN6ZHZndmR2YnlrcHNnZnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTMwMzUsImV4cCI6MjA2NzA4OTAzNX0.ImqAdCzRdPm7xqV4VPO5McpvskvztromVeeEkkn3w1A';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic session refresh
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect session in URL (for OAuth callbacks)
    detectSessionInUrl: true,
  },
});