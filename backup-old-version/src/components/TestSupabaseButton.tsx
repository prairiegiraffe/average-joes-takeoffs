import React, { useState } from 'react';
import { contractorProfileService } from '../utils/contractorProfileService';

export const TestSupabaseButton: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const checkConfig = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('🔧 Environment variables:');
    console.log('VITE_SUPABASE_URL:', url);
    console.log('VITE_SUPABASE_ANON_KEY:', key ? `${key.substring(0, 20)}...` : 'undefined');
    
    if (!url || url === 'your-project-url' || !key || key === 'your-anon-key') {
      setStatus('error');
      setMessage(`❌ Environment variables not set properly:\nURL: ${url}\nKey: ${key ? 'Set' : 'Missing'}`);
    } else {
      setStatus('success');
      setMessage(`✅ Environment variables look good:\nURL: ${url}\nKey: ${key.substring(0, 20)}...`);
    }
  };

  const testSupabaseConnection = async () => {
    setStatus('testing');
    setMessage('Testing Supabase connection...');

    try {
      // Create a test profile
      const testProfile = {
        businessName: "Test Roofing LLC",
        contactName: 'John Contractor',
        email: 'john@testroofing.com',
        phone: '(555) 987-6543',
        address: '456 Test Street',
        city: 'Test City',
        state: 'TX',
        zip: '75001',
        website: 'www.testroofing.com',
        licenseNumber: 'TX-ROOF-67890',
        yearsInBusiness: 8,
        specialties: ['Roofing', 'Repairs', 'Inspections'],
        documents: {
          w9: [],
          license: [],
          insurance: [],
          certificates: []
        }
      };

      // Try to save it
      const success = await contractorProfileService.saveProfile(testProfile);
      
      if (success) {
        setStatus('success');
        setMessage('✅ Successfully saved to Supabase! Check your database.');
      } else {
        setStatus('error');
        setMessage('❌ Failed to save to Supabase. Check console for details.');
      }
    } catch (error) {
      console.error('Test error:', error);
      setStatus('error');
      setMessage(`❌ Error: ${error.message || 'Unknown error'}`);
    }
  };

  const loadFromSupabase = async () => {
    setStatus('testing');
    setMessage('Loading from Supabase...');

    try {
      const profile = await contractorProfileService.getProfile();
      
      if (profile) {
        setStatus('success');
        setMessage(`✅ Loaded profile: ${profile.contactName} from ${profile.businessName}`);
      } else {
        setStatus('error');
        setMessage('❌ No profile found in Supabase');
      }
    } catch (error) {
      console.error('Load error:', error);
      setStatus('error');
      setMessage(`❌ Error loading: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
        🧪 Supabase Test Panel
      </h3>
      
      <div className="space-y-3">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={checkConfig}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Check Config
          </button>

          <button
            onClick={testSupabaseConnection}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'testing' ? 'Testing...' : 'Test Save to Supabase'}
          </button>
          
          <button
            onClick={loadFromSupabase}
            disabled={status === 'testing'}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'testing' ? 'Loading...' : 'Test Load from Supabase'}
          </button>
        </div>
        
        {message && (
          <div className={`text-sm p-3 rounded ${
            status === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
            status === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
            'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
          }`}>
            {message}
          </div>
        )}
        
        <p className="text-xs text-yellow-700 dark:text-yellow-300">
          Use this to test your Supabase connection. Check browser console for detailed logs.
        </p>
      </div>
    </div>
  );
};