// supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables instead of hardcoded values for security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate that environment variables are set
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Supabase environment variables are not properly configured');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);