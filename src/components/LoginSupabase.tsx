import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import { authService } from '../utils/authService';

interface LoginSupabaseProps {
  onLogin: (user: any) => void;
}

export const LoginSupabase: React.FC<LoginSupabaseProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          setError('Check your email for confirmation link!');
          setMode('signin');
        }
      } else {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          // Get or create profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const userData = {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || data.user.email!.split('@')[0],
            role: profile?.role || 'contractor',
            company: profile?.company || 'My Company',
            tenantId: profile?.tenant_id || null
          };

          // Save to localStorage for app compatibility
          localStorage.setItem('averagejoes_user', JSON.stringify(userData));
          
          onLogin(userData);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Quick fill for testing
  const fillTestCredentials = () => {
    setFormData({
      email: 'test@example.com',
      password: 'testpass123'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Average Joe's Takeoffs</h1>
          <p className="mt-2 text-sm text-gray-600">Professional Contractor Management</p>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className={`text-sm text-center ${
              error.includes('Check your email') ? 'text-green-600' : 'text-red-600'
            }`}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>

            <button
              type="button"
              onClick={fillTestCredentials}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Fill Test Credentials
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p>Test Account: test@example.com / testpass123</p>
        </div>
      </div>
    </div>
  );
};