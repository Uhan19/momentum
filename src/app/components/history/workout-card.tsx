'use client';

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

interface WorkoutCardProps {
  workout: WorkoutSessionWithDetails;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const { exercise_templates, workout_session_exercises, start_time, end_time } = workout;

  // Calculate duration
  const duration =
    start_time && end_time ? differenceInMinutes(new Date(end_time), new Date(start_time)) : 0;

  // Calculate total weight lifted
  const totalWeight = workout_session_exercises.reduce((total, exercise) => {
    const exerciseWeight = exercise.exercise_sets.reduce((sum, set) => {
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
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Edit Workout</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
    </Card>
  );
}
