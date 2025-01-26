'use client';

import { useState } from 'react';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';

export const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        {isSignUp ? (
          <SignUpForm onToggle={() => setIsSignUp(false)} />
        ) : (
          <SignInForm onToggle={() => setIsSignUp(true)} />
        )}
      </div>
    </div>
  );
};
