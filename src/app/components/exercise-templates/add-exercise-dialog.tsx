import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, Plus, Save } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
  CommandGroup,
} from '@/components/ui/command';
import { useState } from 'react';
import { ExerciseFields, ExerciseDefinition } from '@/types';
import { FormValues } from './create-exercise-template-dialog';
import { UseFieldArrayReturn } from 'react-hook-form';
import { useExercises, useCreateCustomExercise } from '@/hooks/useExercises';
import { useQueryClient } from '@tanstack/react-query';

interface AddExerciseDialogProps {
  openAddExerciseDialog: boolean;
  setOpenAddExerciseDialog: (open: boolean) => void;
  fields: ExerciseFields;
  append: UseFieldArrayReturn<FormValues, 'exercises', 'id'>['append'];
}

export const AddExerciseDialog = (props: AddExerciseDialogProps) => {
  const { fields, append, openAddExerciseDialog, setOpenAddExerciseDialog } = props;
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: exercises = [] } = useExercises();
  const createCustomExercise = useCreateCustomExercise();
  const queryClient = useQueryClient();

  const handleExerciseClick = (exercise: ExerciseDefinition) => {
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
    try {
      const newExercise = await createCustomExercise(searchValue.trim());
      
      // Add to selected exercises
      setSelectedExercise([...selectedExercise, newExercise]);
      
      // Invalidate queries to refetch exercises
      await queryClient.invalidateQueries({ queryKey: ['exercises'] });
      
      setSearchValue('');
    } catch (error) {
      console.error('Failed to create custom exercise:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <Dialog open={openAddExerciseDialog} onOpenChange={setOpenAddExerciseDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Add exercise
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Choose your exercise</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveExercise}
                disabled={selectedExercise.length === 0}
                className="disabled:cursor-not-allowed enabled:cursor-pointer enabled:text-green-300 mr-4 enabled:border-green-300"
              >
                <Save className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <Command>
              <CommandInput 
                placeholder="Search exercises..." 
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
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
                          className="flex items-center justify-between"
                        >
                          <span>{exercise.name}</span>
                          {selectedExercise.some((element) => element.id === exercise.id) && 
                            <Check className="h-4 w-4 text-primary" />}
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
                          className="flex items-center justify-between"
                        >
                          <span>{exercise.name}</span>
                          {selectedExercise.some((element) => element.id === exercise.id) && 
                            <Check className="h-4 w-4 text-primary" />}
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
