/**
 * Utility to test Supabase connection
 * Use this in the browser console to diagnose connection issues
 */

import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...');
  console.log('');

  // Test 1: Check if client is initialized
  console.log('1️⃣ Checking Supabase client...');
  if (!supabase) {
    console.error('❌ Supabase client is not initialized');
    return;
  }
  console.log('✅ Supabase client initialized');

  // Test 2: Check environment variables
  console.log('');
  console.log('2️⃣ Checking environment variables...');
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log('VITE_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', key ? '✅ Set' : '❌ Missing');
  if (!url || !key) {
    console.warn('⚠️ Environment variables are missing. Using fallback values.');
  }

  // Test 3: Test auth connection
  console.log('');
  console.log('3️⃣ Testing auth connection...');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Auth error:', error);
    } else {
      console.log('✅ Auth connection OK');
      console.log('Session:', session ? 'Active' : 'No active session');
    }
  } catch (error) {
    console.error('❌ Auth connection failed:', error);
  }

  // Test 4: Test database connection
  console.log('');
  console.log('4️⃣ Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
    } else {
      console.log('✅ Database connection OK');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }

  // Test 5: Check CORS
  console.log('');
  console.log('5️⃣ Testing CORS...');
  try {
    const response = await fetch('https://vklayzyhocjpicnblwfx.supabase.co/rest/v1/', {
      method: 'OPTIONS',
    });
    console.log('CORS preflight:', response.ok ? '✅ OK' : '❌ Failed');
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }

  console.log('');
  console.log('🏁 Connection test completed');
};

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).testSupabaseConnection = testSupabaseConnection;
}

