import 'react-native-url-polyfill/dist/polyfill';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from './database.types';
import { mockSupabase } from './mockSupabase';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Check if real Supabase credentials are configured
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const USE_MOCK = !supabaseUrl || !supabaseAnonKey ||
  supabaseUrl === 'YOUR_SUPABASE_URL' ||
  supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY';

// Log which mode we're using
if (USE_MOCK) {
  console.log('🧪 Running in MOCK MODE - data stored locally');
} else {
  console.log('🔗 Connected to Supabase');
}

// Create real Supabase client or use mock
const realSupabase = USE_MOCK
  ? null
  : createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: ExpoSecureStoreAdapter as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

// Export the appropriate client
export const supabase = (USE_MOCK ? mockSupabase : realSupabase) as any;

// Export flag to check if using mock
export const isMockMode = USE_MOCK;
