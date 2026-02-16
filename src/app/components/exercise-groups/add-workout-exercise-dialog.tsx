import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { useExercises, useCreateCustomExercise, Exercise } from '@/hooks/useExercises';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/providers/supabase-provider';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';
import { TemplateExerciseWithDefinition } from '@/types';

interface AddWorkoutExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  workoutSessionId: string;
  existingExerciseIds: string[];
}

export const AddWorkoutExerciseDialog = ({
  open,
  onOpenChange,
  templateId,
  workoutSessionId,
  existingExerciseIds,
}: AddWorkoutExerciseDialogProps) => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const { data: exercises = [] } = useExercises();
  const createCustomExercise = useCreateCustomExercise();
  const queryClient = useQueryClient();
  const { supabase } = useSupabase();
  const addExerciseToWorkout = useExerciseTemplateStore((state) => state.addExerciseToWorkout);
  const exerciseTemplate = useExerciseTemplateStore(
    (state) => state.exerciseTemplates[templateId],
  );

  // Filter out exercises already in the workout
  const availableExercises = exercises.filter(
    (ex) => !existingExerciseIds.includes(ex.id),
  );

  const handleExerciseClick = (exercise: Exercise) => {
    if (selectedExercises.some((e) => e.id === exercise.id)) {
      setSelectedExercises(selectedExercises.filter((e) => e.id !== exercise.id));
    } else {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  const handleSave = async () => {
    if (selectedExercises.length === 0) return;
    setIsSaving(true);

    try {
      const currentLength = exerciseTemplate?.length || 0;

      for (let i = 0; i < selectedExercises.length; i++) {
        const exercise = selectedExercises[i];

        // Insert workout_session_exercises row in DB
        const { data: sessionExercise, error } = await supabase
          .from('workout_session_exercises')
          .insert({
            workout_session_id: workoutSessionId,
            exercise_id: exercise.id,
            planned_sets: 3,
            planned_reps: 10,
            weight_type: 'lbs',
            order_index: currentLength + i,
            is_template_exercise: false,
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to insert workout session exercise:', error);
          continue;
        }

        // Add to Zustand store
        const templateExercise: TemplateExerciseWithDefinition = {
          id: sessionExercise.id,
          template_id: templateId,
          exercise_id: exercise.id,
          sets: 3,
          reps: 10,
          weight_type: 'lbs',
          order_index: currentLength + i,
          created_at: null,
          exercise_definitions: {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description || null,
            created_at: null,
          },
        };

        addExerciseToWorkout(templateId, templateExercise);
      }

      setSelectedExercises([]);
      setSearchValue('');
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
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

      setSelectedExercises([...selectedExercises, newExercise]);
      await queryClient.invalidateQueries({ queryKey: ['exercises'] });
      setSearchValue('');
    } catch {
      setCreateError('Failed to create exercise. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Add Exercise to Workout</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={selectedExercises.length === 0 || isSaving}
              className="disabled:opacity-50 disabled:cursor-not-allowed text-primary hover:text-primary/80"
            >
              <Check className="h-4 w-4 mr-2" />
              {isSaving ? 'Adding...' : `Add ${selectedExercises.length > 0 ? `(${selectedExercises.length})` : ''}`}
            </Button>
          </DialogTitle>
          <Command className="border-0">
            <CommandInput
              placeholder="Search exercises..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList className="max-h-[400px]">
              <CommandEmpty>
                <div className="flex flex-col items-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No exercise found.</p>
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
              {availableExercises.filter((ex) => !ex.isCustom).length > 0 && (
                <CommandGroup heading="System Exercises">
                  {availableExercises
                    .filter((ex) => !ex.isCustom)
                    .map((exercise) => (
                      <CommandItem
                        onSelect={() => handleExerciseClick(exercise)}
                        key={exercise.id}
                        className="flex items-center justify-between py-3 px-3 rounded-md data-[selected=true]:bg-muted"
                      >
                        <span className="text-sm">{exercise.name}</span>
                        <div
                          className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                            selectedExercises.some((e) => e.id === exercise.id)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/50'
                          }`}
                        >
                          {selectedExercises.some((e) => e.id === exercise.id) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              {availableExercises.filter((ex) => ex.isCustom).length > 0 && (
                <CommandGroup heading="My Custom Exercises">
                  {availableExercises
                    .filter((ex) => ex.isCustom)
                    .map((exercise) => (
                      <CommandItem
                        onSelect={() => handleExerciseClick(exercise)}
                        key={exercise.id}
                        className="flex items-center justify-between py-3 px-3 rounded-md data-[selected=true]:bg-muted"
                      >
                        <span className="text-sm">{exercise.name}</span>
                        <div
                          className={`h-4 w-4 rounded-sm border flex items-center justify-center ${
                            selectedExercises.some((e) => e.id === exercise.id)
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/50'
                          }`}
                        >
                          {selectedExercises.some((e) => e.id === exercise.id) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
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
  );
};
