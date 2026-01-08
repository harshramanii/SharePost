// Import URL polyfill FIRST before Supabase
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'https://ksvwhpniiptkapnyrxmt.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzdndocG5paXB0a2FwbnlyeG10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2Nzk1NTAsImV4cCI6MjA4MzI1NTU1MH0.eRNqMZc4OES0qhB_DndblO0Gns8Tg5Tn86p4lYtT8s8';

// Create Supabase client with React Native compatible configuration
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;




