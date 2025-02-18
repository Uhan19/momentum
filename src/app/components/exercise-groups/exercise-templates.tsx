import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StartExerciseTemplateDialog } from './start-exercise-template-dialog';
import { useQueryExerciseTemplate } from '@/hooks/useExerciseTemplate';

interface ExerciseTemplatesProps {
  selectedGroupId: string | null;
}

export const ExerciseTemplates = ({ selectedGroupId }: ExerciseTemplatesProps) => {
  const { exerciseTemplates } = useQueryExerciseTemplate(selectedGroupId);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {exerciseTemplates?.map((template) => {
        const { id, title, notes, template_exercises } = template;
        return (
          <Card key={id} className="flex flex-row justify-between items-center">
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
              {notes && <CardDescription>{notes}</CardDescription>}
            </CardHeader>
            <StartExerciseTemplateDialog
              id={id}
              title={title}
              notes={notes}
              templateExerciseAndDefinition={template_exercises}
            />
          </Card>
        );
      })}
      {exerciseTemplates?.length === 0 && (
        <div className="text-sm text-muted-foreground">No templates yet</div>
      )}
    </div>
  );
};
