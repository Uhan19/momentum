import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useQueryExerciseTemplate = (selectedGroupId: string | null) => {
  const { data: exerciseTemplates } = useQuery({
    queryKey: ['exerciseTemplates', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const { data, error } = await supabase
        .from('exercise_templates')
        .select(
          `
        *,
        template_exercises (
          *,
          exercise_definitions: exercise_definitions!exercise_id (*)
        )
      `,
        )
        .eq('group_id', selectedGroupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedGroupId,
    staleTime: 60 * 1000,
  });

  return { exerciseTemplates };
};
