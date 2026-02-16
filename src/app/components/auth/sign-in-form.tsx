'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import type { Database } from '@/lib/database.types';

export const SignInForm = ({ onToggle }: { onToggle: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const signInMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Set session cookie
      await supabase.auth.setSession(data.session);

      return 'Success';
    },
    onSuccess: () => {
      router.push('/');
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        signInMutation.mutate();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        disabled={signInMutation.isPending}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
      >
        {signInMutation.isPending ? 'Signing In...' : 'Sign In'}
      </button>
      {signInMutation.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {signInMutation.error instanceof Error
            ? signInMutation.error.message
            : 'An error occurred'}
        </div>
      )}
      <div className="text-center">
        <button
          type="button"
          onClick={onToggle}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          Need an account? Sign Up
        </button>
      </div>
    </form>
  );
};
