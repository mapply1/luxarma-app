import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Missing Supabase environment variables. Please check your configuration.';
  logger.error(errorMessage);
  throw new Error(errorMessage);
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  const errorMessage = 'Invalid Supabase URL format';
  logger.error(errorMessage, { supabaseUrl });
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // More secure auth flow
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting for production
    },
  },
  global: {
    headers: {
      'X-Client-Info': `luxarma-app@${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`,
    },
  },
});

// Add connection monitoring in development
if (process.env.NODE_ENV === 'development') {
  supabase.auth.onAuthStateChange((event, session) => {
    logger.debug(`Auth state changed: ${event}`, { userId: session?.user?.id });
  });
}