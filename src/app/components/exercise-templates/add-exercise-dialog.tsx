import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, Plus } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from '@/components/ui/command';
import { useState } from 'react';
import { ExerciseFields } from '@/types';
import { FormValues } from './create-exercise-template-dialog';
import { UseFieldArrayReturn } from 'react-hook-form';
import { useExercises, useCreateCustomExercise, Exercise } from '@/hooks/useExercises';
import { useQueryClient } from '@tanstack/react-query';

interface AddExerciseDialogProps {
  openAddExerciseDialog: boolean;
  setOpenAddExerciseDialog: (open: boolean) => void;
  fields: ExerciseFields;
  append: UseFieldArrayReturn<FormValues, 'exercises', 'id'>['append'];
}

export const AddExerciseDialog = (props: AddExerciseDialogProps) => {
  const { fields, append, openAddExerciseDialog, setOpenAddExerciseDialog } = props;
  const [selectedExercise, setSelectedExercise] = useState<Exercise[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: exercises = [] } = useExercises();
  const createCustomExercise = useCreateCustomExercise();
  const queryClient = useQueryClient();

  const handleExerciseClick = (exercise: Exercise) => {
    if (selectedExercise.filter((element) => element.id === exercise.id).length === 0) {
      setSelectedExercise([...selectedExercise, exercise]);
    } else {
      setSelectedExercise(selectedExercise.filter((element) => element.id !== exercise.id));
    }
  };

  const handleSaveExercise = () => {
    selectedExercise.forEach((exercise, index) => {
      append({
        exercise_id: exercise.id,
        sets: 3,
        reps: 10,
        weight_type: 'lbs',
        order_index: fields.length + index,
      });
    });
    setSelectedExercise([]);
    setSearchValue('');
    setOpenAddExerciseDialog(false);
  };

  const handleCreateCustom = async () => {
    if (!searchValue.trim()) return;

    setIsCreating(true);
    setCreateError(null);
    try {
      const data = await createCustomExercise(searchValue.trim());
      const newExercise: Exercise = {
        id: data.id,
        name: data.name,
        description: data.description,
        isCustom: true,
      };

      // Add to selected exercises
      setSelectedExercise([...selectedExercise, newExercise]);

      // Invalidate queries to refetch exercises
      await queryClient.invalidateQueries({ queryKey: ['exercises'] });

      setSearchValue('');
    } catch {
      setCreateError('Failed to create exercise. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <Dialog open={openAddExerciseDialog} onOpenChange={setOpenAddExerciseDialog}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add exercise
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Choose your exercise</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveExercise}
                disabled={selectedExercise.length === 0}
                className="disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:text-primary/80"
              >
                <Check className="h-4 w-4 mr-2" />
                Add {selectedExercise.length > 0 && `(${selectedExercise.length})`}
              </Button>
            </DialogTitle>
            <Command className="border-0">
              <CommandInput
                placeholder="Search exercises..."
                value={searchValue}
                onValueChange={setSearchValue}
                // className="border-b"
              />
              <CommandList className="max-h-[400px]">
                <CommandEmpty>
                  <div className="flex flex-col items-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      No exercise found.
                    </p>
                    {searchValue && (
                      <Button
                        size="sm"
                        onClick={handleCreateCustom}
                        disabled={isCreating}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {isCreating ? 'Creating...' : `Create "${searchValue}"`}
                      </Button>
                    )}
                    {createError && (
                      <p className="text-sm text-destructive mt-2">{createError}</p>
                    )}
                  </div>
                </CommandEmpty>
                {exercises.filter(ex => !ex.isCustom).length > 0 && (
                  <CommandGroup heading="System Exercises">
                    {exercises
                      .filter(ex => !ex.isCustom)
                      .map((exercise) => (
                        <CommandItem
                          onSelect={() => handleExerciseClick(exercise)}
                          key={exercise.id}
                          className="flex items-center justify-between py-3 px-3 rounded-md data-[selected=true]:bg-muted"
                        >
                          <span className="text-sm">{exercise.name}</span>
                          <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                            selectedExercise.some((element) => element.id === exercise.id)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/50'
                          }`}>
                            {selectedExercise.some((element) => element.id === exercise.id) &&
                              <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
                {exercises.filter(ex => ex.isCustom).length > 0 && (
                  <CommandGroup heading="My Custom Exercises">
                    {exercises
                      .filter(ex => ex.isCustom)
                      .map((exercise) => (
                        <CommandItem
                          onSelect={() => handleExerciseClick(exercise)}
                          key={exercise.id}
                          className="flex items-center justify-between py-3 px-3 rounded-md data-[selected=true]:bg-muted"
                        >
                          <span className="text-sm">{exercise.name}</span>
                          <div className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                            selectedExercise.some((element) => element.id === exercise.id)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/50'
                          }`}>
                            {selectedExercise.some((element) => element.id === exercise.id) &&
                              <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
