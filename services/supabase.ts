import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

// FIX: Restoring the Supabase client.
// Although the application is moving towards a server-side architecture, the existing
// React components still require a client-side Supabase instance to function.
// This client is initialized here to resolve import errors throughout the frontend.
const supabaseUrl = 'https://dkfissjbxaevmxcqvpai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrZmlzc2pieGFldm14Y3F2cGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNzQ3NjIsImV4cCI6MjA3ODY1MDc2Mn0.jvhYLRPvgkOa-Yx4So9-b3MfouLoRl9f-iHgkldxEcI';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
