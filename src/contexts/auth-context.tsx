'use client';

import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session?.user ?? null;
    },
    staleTime: Infinity,
  });

  // Set up auth state listener
  useQuery({
    queryKey: ['auth-listener'],
    queryFn: async () => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      });
      return subscription;
    },
    staleTime: Infinity,
  });

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
