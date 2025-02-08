import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StartExerciseTemplateDialog } from './start-exercise-template-dialog';
type ExerciseTemplate = {
  id: string;
  title: string;
  notes: string | null;
  created_at: string;
};

interface ExerciseTemplatesProps {
  selectedGroupId: string | null;
}

export const ExerciseTemplates = ({ selectedGroupId }: ExerciseTemplatesProps) => {
  const { data: exerciseTemplates } = useQuery({
    queryKey: ['exerciseTemplates', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return [];
      const { data, error } = await supabase
        .from('exercise_templates')
        .select('*')
        .eq('group_id', selectedGroupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExerciseTemplate[];
    },
    enabled: !!selectedGroupId,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {exerciseTemplates?.map((template) => (
        <Card key={template.id} className="flex flex-row justify-between items-center">
          <CardHeader>
            <CardTitle className="text-base">{template.title}</CardTitle>
            {template.notes && <CardDescription>{template.notes}</CardDescription>}
          </CardHeader>
          <StartExerciseTemplateDialog templateId={template.id} />
        </Card>
      ))}
      {exerciseTemplates?.length === 0 && (
        <div className="text-sm text-muted-foreground">No templates yet</div>
      )}
    </div>
  );
};
