import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@/providers/supabase-provider';

export interface Exercise {
  id: string;
  name: string;
  description?: string | null;
  isCustom?: boolean;
}

export function useExercises() {
  const { supabase, user } = useSupabase();

  return useQuery({
    queryKey: ['exercises', user?.id],
    queryFn: async () => {
      // Fetch all exercises (system and custom for the current user)
      const { data: exercises, error } = await supabase
        .from('exercise_definitions')
        .select('id, name, description, is_custom')
        .or(`is_custom.eq.false,user_id.eq.${user?.id}`)
        .order('name');

      if (error) {
        console.error('Error fetching exercises:', error);
        throw error;
      }


      // Map to include isCustom field for compatibility
      const allExercises: Exercise[] = (exercises || []).map(ex => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        isCustom: ex.is_custom || false
      }));

      return allExercises;
    },
    enabled: !!user?.id,
  });
}

export function useCreateCustomExercise() {
  const { supabase, user } = useSupabase();

  return async (name: string, description?: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('exercise_definitions')
      .insert({
        user_id: user.id,
        name,
        description,
        is_custom: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom exercise:', error);
      throw error;
    }

    return data;
  };
}