'use client';

import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';

export const ProfileForm = () => {
  const { profile, updateProfile } = useProfile();
  const [username, setUsername] = useState(profile?.username || '');
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      username,
      full_name: fullName,
    });
  };

  if (updateProfile.isSuccess) {
    return (
      <div className="p-4 bg-green-100 text-green-700 rounded-md">
        Profile updated successfully!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        />
      </div>

      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
      >
        {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
      </button>

      {updateProfile.error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {updateProfile.error instanceof Error ? updateProfile.error.message : 'An error occurred'}
        </div>
      )}
    </form>
  );
};
