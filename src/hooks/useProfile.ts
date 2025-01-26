import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Profile, UpdateProfileData } from '@/types';
import { useAuth } from '@/contexts';

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updateData: UpdateProfileData) => {
      if (!user?.id) throw new Error('No user');

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile,
  };
};
