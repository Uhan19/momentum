'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const SignUpForm = ({ onToggle }: { onToggle: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  const signUpMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Sign in immediately after signup
      if (data.user) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }

      return 'Signup successful';
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
        signUpMutation.mutate();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
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
        disabled={signUpMutation.isPending}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
      >
        {signUpMutation.isPending ? 'Creating Account...' : 'Sign Up'}
      </button>
      {signUpMutation.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {signUpMutation.error instanceof Error
            ? signUpMutation.error.message
            : 'An error occurred'}
        </div>
      )}
      {signUpMutation.isSuccess && (
        <div className="p-3 bg-green-100 text-green-700 rounded">{signUpMutation.data}</div>
      )}
      <div className="text-center">
        <button
          type="button"
          onClick={onToggle}
          className="text-blue-500 hover:text-blue-600 text-sm"
        >
          Already have an account? Sign In
        </button>
      </div>
    </form>
  );
};
