import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Dumbbell, Play } from 'lucide-react';
import { TemplateExercisesWithDefinitionsArray } from '@/types';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';
import { useRouter } from 'next/navigation';

interface StartExerciseTemplateDialogProps {
  id: string;
  title: string;
  notes: string;
  templateExerciseAndDefinition: TemplateExercisesWithDefinitionsArray;
}

export const StartExerciseTemplateDialog = ({
  id,
  title,
  notes,
  templateExerciseAndDefinition,
}: StartExerciseTemplateDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const setExerciseTemplate = useExerciseTemplateStore((state) => state.setExerciseTemplate);

  useEffect(() => {
    if (templateExerciseAndDefinition) {
      setExerciseTemplate(id, templateExerciseAndDefinition);
    }
  }, [setExerciseTemplate, templateExerciseAndDefinition, id]);

  console.log('templateExerciseAndDefinition', templateExerciseAndDefinition);

  return (
    <div className="">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="h-10 w-25 bg-green-200 hover:bg-green-400 mr-6 dark:bg-green-800 dark:hover:bg-green-700"
            variant="secondary"
            onClick={() => setOpen(true)}
          >
            <span className="font-bold">Preview</span>
            <Dumbbell />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 border-none shadow-2xl shadow-white rounded-md max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader className="flex flex-col gap-2 items-start p-4">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{notes}</DialogDescription>
          </DialogHeader>
          {templateExerciseAndDefinition?.map((exercise) => {
            const { sets, reps, exercise_definitions } = exercise;
            const { name, description } = exercise_definitions;
            return (
              <div className="flex flex-col px-4" key={exercise.id}>
                <h1 className="font-bold">{name}</h1>
                <p>{description}</p>
                <p className="italic">
                  {sets} sets of {reps} reps
                </p>
              </div>
            );
          })}
          <div className="flex justify-center px-4 mb-4">
            <Button
              className="w-full bg-green-200 hover:bg-green-400 mr-6 dark:bg-green-800 dark:hover:bg-green-700"
              variant="secondary"
              onClick={() => router.push(`/exercises/template/${id}`)}
            >
              <Play />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
