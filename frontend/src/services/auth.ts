import { supabase } from '../utils/supabaseClient';
import { User } from '../types';

// Authentication service utilities
export class AuthService {
  // Sign up a new user
  static async signUp(email: string, password: string, fullName?: string): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || 'MyPortfolioTracker User'
          }
        }
      });

      if (error) {
        console.error('Signup error:', error.message);
        return { user: null, error: this.formatAuthError(error.message) };
      }

      console.log('Signup success:', data);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { user: null, error: 'An unexpected error occurred during signup' };
    }
  }

  // Sign in an existing user
  static async signIn(email: string, password: string): Promise<{ user: any; error: any }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Signin error:', error.message);
        return { user: null, error: this.formatAuthError(error.message) };
      }

      console.log('Signin success:', data);
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Unexpected signin error:', error);
      return { user: null, error: 'An unexpected error occurred during signin' };
    }
  }

  // Sign out current user
  static async signOut(): Promise<{ error: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error.message);
        return { error: error.message };
      }

      console.log('Signout success');
      return { error: null };
    } catch (error) {
      console.error('Unexpected signout error:', error);
      return { error: 'An unexpected error occurred during signout' };
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Update user profile
  static async updateProfile(updates: { full_name?: string; avatar_url?: string }): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Send password reset email
  static async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  // Check if email is valid
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if password meets requirements
  static isValidPassword(password: string): { isValid: boolean; message: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    
    return { isValid: true, message: '' };
  }

  // Format auth errors for user display
  static formatAuthError(error: string): string {
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'User not found': 'No account found with this email address.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'Invalid email': 'Please enter a valid email address.',
      'Signup not allowed': 'Account creation is currently not available.',
      'Password is too weak': 'Password is too weak. Please choose a stronger password.',
      'User already registered': 'An account with this email already exists. Please sign in instead.',
      'Email address already in use': 'This email address is already registered. Please sign in instead.',
      'Too many requests': 'Too many requests. Please wait a moment before trying again.',
    };

    return errorMap[error] || error;
  }
}

// Export utility functions for convenience
export const { 
  signUp,
  signIn,
  signOut,
  isAuthenticated, 
  getCurrentUser, 
  updateProfile, 
  resetPassword, 
  updatePassword, 
  isValidEmail, 
  isValidPassword, 
  formatAuthError 
} = AuthService;