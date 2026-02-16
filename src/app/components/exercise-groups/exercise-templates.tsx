import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StartExerciseTemplateDialog } from './start-exercise-template-dialog';
import { EditExerciseTemplateDialog } from '../exercise-templates/edit-exercise-template-dialog';
import { useQueryExerciseTemplate } from '@/hooks/useExerciseTemplate';
import { Button } from '@/components/ui/button';
import { Edit2 } from 'lucide-react';

interface ExerciseTemplatesProps {
  selectedGroupId: string | null;
}

export const ExerciseTemplates = ({ selectedGroupId }: ExerciseTemplatesProps) => {
  const { exerciseTemplates } = useQueryExerciseTemplate(selectedGroupId);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {exerciseTemplates?.map((template) => {
          const { id, title, notes, template_exercises } = template;
          return (
            <Card key={id} className="flex flex-row justify-between items-center">
              <CardHeader className="flex-1">
                <CardTitle className="text-base">{title}</CardTitle>
                {notes && <CardDescription>{notes}</CardDescription>}
              </CardHeader>
              <div className="flex items-center gap-2 pr-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTemplate(id)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <StartExerciseTemplateDialog
                  id={id}
                  title={title}
                  notes={notes}
                  templateExerciseAndDefinition={template_exercises}
                  groupId={selectedGroupId || ''}
                />
              </div>
            </Card>
          );
        })}
        {exerciseTemplates?.length === 0 && (
          <div className="text-sm text-muted-foreground">No templates yet</div>
        )}
      </div>
      
      {/* Edit dialogs */}
      {exerciseTemplates?.map((template) => (
        <EditExerciseTemplateDialog
          key={template.id}
          open={editingTemplate === template.id}
          onOpenChange={(open) => !open && setEditingTemplate(null)}
          templateId={template.id}
          title={template.title}
          notes={template.notes || ''}
          exercises={template.template_exercises}
          groupId={selectedGroupId || ''}
        />
      ))}
    </>
  );
};
