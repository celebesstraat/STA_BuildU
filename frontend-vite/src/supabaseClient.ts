import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock data for development
const mockUser = {
  id: 'mock-user-id',
  first_name: 'Sarah',
  last_name: 'Johnson',
  email: 'sarah@example.com'
};

const mockSession = {
  access_token: 'mock-token',
  user: mockUser
};

const mockGoals = [
  { id: 1, title: 'Find Employment', progress: 80, user_id: 'mock-user-id' },
  { id: 2, title: 'Digital Skills', progress: 60, user_id: 'mock-user-id' },
  { id: 3, title: 'Wellbeing', progress: 90, user_id: 'mock-user-id' }
];

// Create mock or real client based on environment
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('Using mock Supabase client for development');
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Development mode - no auth') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Development mode - no auth') }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({ data: { user: mockUser }, error: null })
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => {
            if (table === 'users') {
              return {
                single: () => Promise.resolve({ data: mockUser, error: null })
              };
            } else if (table === 'goals') {
              return Promise.resolve({ data: mockGoals, error: null });
            }
            return Promise.resolve({ data: [], error: null });
          }
        })
      })
    } as unknown;
  } else {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
};

export const supabase = createSupabaseClient();
