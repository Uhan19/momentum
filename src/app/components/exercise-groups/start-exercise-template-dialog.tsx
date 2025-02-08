import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Play } from 'lucide-react';
import { TemplateExercisesWithDefinitionsArray } from '@/types';
import { ExerciseRows } from './exercise-rows';
interface StartExerciseTemplateDialogProps {
  title: string;
  notes: string;
  templateExerciseAndDefinition: TemplateExercisesWithDefinitionsArray;
}

export const StartExerciseTemplateDialog = ({
  title,
  notes,
  templateExerciseAndDefinition,
}: StartExerciseTemplateDialogProps) => {
  const [open, setOpen] = useState(false);

  console.log('templateExerciseAndDefinition', templateExerciseAndDefinition);

  return (
    <div className="">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="h-10 w-10 bg-green-200 hover:bg-green-400 mr-6 dark:bg-green-800 dark:hover:bg-green-700"
            variant="secondary"
            onClick={() => setOpen(true)}
          >
            <Play />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 border-none shadow-2xl shadow-white rounded-md max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader className="flex flex-col gap-2 items-start p-4">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{notes}</DialogDescription>
          </DialogHeader>
          {templateExerciseAndDefinition?.map((exercise) => (
            <ExerciseRows key={exercise.id} exercises={exercise} />
          ))}
          <div className="flex justify-center px-4 mb-4">
            <Button className="w-full" variant="destructive">
              Cancel workout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
