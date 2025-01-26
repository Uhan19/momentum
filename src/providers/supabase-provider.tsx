'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  user: User | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient());
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      console.log('Initial session check:', session?.user ? 'Logged in' : 'No session');
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return <Context.Provider value={{ supabase, user }}>{children}</Context.Provider>;
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};
