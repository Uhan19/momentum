'use client';

import { useState } from 'react';
import { WorkoutSessionWithDetails, BestSet } from '@/types';
import { format, differenceInMinutes } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { ExerciseListItem } from './exercise-list-item';
import { WorkoutStats } from './workout-stats';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSupabase } from '@/providers/supabase-provider';
import { useQueryClient } from '@tanstack/react-query';

interface WorkoutCardProps {
  workout: WorkoutSessionWithDetails;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const { exercise_templates, workout_session_exercises, start_time, end_time } = workout;
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Calculate duration
  const duration =
    start_time && end_time ? differenceInMinutes(new Date(end_time), new Date(start_time)) : 0;

  // Calculate total weight lifted
  const totalWeight = workout_session_exercises.reduce((total, exercise) => {
    const exerciseWeight = exercise.exercise_sets.reduce((sum, set) => { // exercise_sets is empty here
      if (set.completed && set.weight && set.reps) {
        return sum + set.weight * set.reps;
      }
      return sum;
    }, 0);
    return total + exerciseWeight;
  }, 0);

  // Find best set for each exercise
  const getBestSet = (
    exerciseSets: (typeof workout_session_exercises)[0]['exercise_sets'],
  ): BestSet | null => {
    let bestSet: BestSet | null = null;
    let maxVolume = 0;

    exerciseSets.forEach((set) => {
      if (set.completed && set.weight && set.reps) {
        const volume = set.weight * set.reps;
        if (volume > maxVolume) {
          maxVolume = volume;
          bestSet = {
            weight: set.weight,
            reps: set.reps,
            weightType: workout_session_exercises[0]?.weight_type || 'lb',
          };
        }
      }
    });

    return bestSet;
  };

  const handleDelete = async () => {
    setDeleteError(null);
    try {
      // Delete exercise_sets first, then workout_session_exercises, then the session
      const { error: setsError } = await supabase
        .from('exercise_sets')
        .delete()
        .eq('workout_session_id', workout.id);

      if (setsError) throw setsError;

      const { error: exercisesError } = await supabase
        .from('workout_session_exercises')
        .delete()
        .eq('workout_session_id', workout.id);

      if (exercisesError) throw exercisesError;

      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .delete()
        .eq('id', workout.id);

      if (sessionError) throw sessionError;

      await queryClient.invalidateQueries({ queryKey: ['history'] });
      setShowDeleteDialog(false);
    } catch {
      setDeleteError('Failed to delete workout. Please try again.');
    }
  };

  // Format date
  const workoutDate = start_time ? new Date(start_time) : new Date();
  const formattedDate = format(workoutDate, 'EEEE, MMM d');

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{exercise_templates.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mt-1 -mr-2">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <WorkoutStats duration={duration} totalWeight={totalWeight} />

        <div className="mt-6 space-y-1">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-3 px-1">
            <span>Exercise</span>
            <span>Best Set</span>
          </div>
          {workout_session_exercises
            .sort((a, b) => a.order_index - b.order_index)
            .map((exercise) => {
              const bestSet = getBestSet(exercise.exercise_sets);
              return (
                <ExerciseListItem
                  key={exercise.id}
                  exerciseName={exercise.exercise_definitions.name}
                  completedSets={exercise.exercise_sets.filter((s) => s.completed).length}
                  bestSet={bestSet}
                />
              );
            })}
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-5/6 bg-popover border-none rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this workout and all its data. This action cannot be undone.
            </AlertDialogDescription>
            {deleteError && (
              <p className="text-sm text-destructive mt-2">{deleteError}</p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
