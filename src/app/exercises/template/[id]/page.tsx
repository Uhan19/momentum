'use client';

import { useEffect, useState } from 'react';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';
import { ExerciseRows } from '@/app/components/exercise-groups/exercise-rows';
import { AddWorkoutExerciseDialog } from '@/app/components/exercise-groups/add-workout-exercise-dialog';
import { Button } from '@/components/ui/button';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/providers/supabase-provider';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { WorkoutTimer } from '@/app/components/workout-timer';
import { SetData } from '@/types/exercise.types';
import { Plus } from 'lucide-react';

type ExerciseSetInsert = {
  workout_session_id: string;
  workout_session_exercise_id?: string;
  exercise_id: string;
  set_number: number;
  weight?: number;
  reps?: number;
  completed?: boolean;
  notes?: string;
};

const TemplatePage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showIncompleteExercisesDialog, setShowIncompleteExercisesDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showAddExerciseDialog, setShowAddExerciseDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const workoutSessionId = searchParams.get('session');
  const exerciseTemplate = useExerciseTemplateStore(
    (state) => state.exerciseTemplates[id as string],
  );
  const exerciseTemplateTitle = useExerciseTemplateStore((state) => state.exerciseTemplateTitle);
  const exerciseTemplateNotes = useExerciseTemplateStore((state) => state.exerciseTemplateNotes);
  const removeExerciseFromWorkout = useExerciseTemplateStore(
    (state) => state.removeExerciseFromWorkout,
  );
  const [workoutStartTime, setWorkoutStartTime] = useState<string>('');

  useEffect(() => {
    // Check for session ID in URL
    if (!workoutSessionId) {
      // Try to recover from localStorage
      const savedSession = localStorage.getItem('current_workout_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.templateId === id) {
          setWorkoutStartTime(session.startTime);
          router.push(`/exercises/template/${id}?session=${session.sessionId}`);
        } else {
          console.warn('Saved session is for a different template');
          localStorage.removeItem('current_workout_session');
        }
      }
    } else {
      // Get start time from localStorage for existing session
      const savedSession = localStorage.getItem('current_workout_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setWorkoutStartTime(session.startTime);
      }
    }
  }, [workoutSessionId, id, router]);

  const handleFinishWorkout = async (sessionId: string, updateTemplate: boolean) => {
    try {
      // Collect all exercise set data from localStorage
      const exerciseSetData: ExerciseSetInsert[] = [];
      let hasIncompleteExercises = false;
      const incompleteExercises: string[] = [];

      // Fetch workout_session_exercises to get their IDs for linking sets
      const { data: sessionExercises, error: fetchError } = await supabase
        .from('workout_session_exercises')
        .select('id, exercise_id')
        .eq('workout_session_id', sessionId);

      if (fetchError) {
        setErrorMessage('Failed to load workout exercises. Please try again.');
        setShowErrorDialog(true);
        return;
      }

      // Build a map of exercise_id -> workout_session_exercise_id
      const exerciseToSessionExercise = new Map<string, string>();
      sessionExercises?.forEach((se) => {
        exerciseToSessionExercise.set(se.exercise_id, se.id);
      });

      // Get all exercises from the dynamic store state (includes mid-workout additions)
      if (exerciseTemplate) {
        for (const exercise of exerciseTemplate) {
          if (exercise.exercise_definitions?.id) {
            const exerciseKey = `workout_${sessionId}_exercise_${exercise.exercise_definitions.id}`;
            const storedData = localStorage.getItem(exerciseKey);

            if (storedData) {
              const setData = JSON.parse(storedData) as Record<string, SetData>;

              // Check if this exercise has any completed sets
              let exerciseHasCompletedSets = false;
              const sessionExerciseId = exerciseToSessionExercise.get(exercise.exercise_definitions.id);

              // Create exercise_sets records for each set
              Object.entries(setData).forEach(([setNumber, data]) => {
                if (data.completed) {
                  exerciseHasCompletedSets = true;
                  exerciseSetData.push({
                    workout_session_id: sessionId,
                    workout_session_exercise_id: sessionExerciseId,
                    exercise_id: exercise.exercise_definitions.id,
                    set_number: parseInt(setNumber),
                    weight: data.weight || 0,
                    reps: data.reps || 0,
                    completed: true,
                  });
                }
              });

              // If no sets were completed for this exercise, track it
              if (!exerciseHasCompletedSets) {
                hasIncompleteExercises = true;
                incompleteExercises.push(exercise.exercise_definitions.name);
              }

              // Clean up the exercise data from localStorage
              localStorage.removeItem(exerciseKey);
            } else {
              // No data stored for this exercise means it wasn't touched
              hasIncompleteExercises = true;
              incompleteExercises.push(exercise.exercise_definitions.name);
            }
          }
        }
      }

      // Check if there are incomplete exercises
      if (hasIncompleteExercises) {
        setShowIncompleteExercisesDialog(true);
        return;
      }

      // Save all exercise sets to the database
      if (exerciseSetData.length > 0) {
        const { error: setsError } = await supabase.from('exercise_sets').insert(exerciseSetData);

        if (setsError) {
          setErrorMessage('Failed to save exercise sets. Your workout data was not saved. Please try again.');
          setShowErrorDialog(true);
          return;
        }
      }

      // Update workout session status
      const { error: sessionError } = await supabase
        .from('workout_sessions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (sessionError) {
        setErrorMessage('Failed to complete workout session. Please try again.');
        setShowErrorDialog(true);
        return;
      }

      // If user chose to update the template, do it now
      if (updateTemplate) {
        await updateTemplateFromWorkout();
      }

      localStorage.removeItem('current_workout_session');

      await queryClient.invalidateQueries({ queryKey: ['history'] });
      router.push('/');
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowErrorDialog(true);
    }
  };

  const updateTemplateFromWorkout = async () => {
    if (!exerciseTemplate || !id) return;

    try {
      // Fetch existing template_exercises for this template
      const { data: existingRows } = await supabase
        .from('template_exercises')
        .select('id, exercise_id')
        .eq('template_id', id as string);

      const existingMap = new Map(
        (existingRows || []).map((row) => [row.exercise_id, row.id]),
      );

      // Build the desired state from the current workout store
      const currentExerciseIds = new Set<string>();

      for (let i = 0; i < exerciseTemplate.length; i++) {
        const exercise = exerciseTemplate[i];
        const exerciseDefId = exercise.exercise_definitions?.id || exercise.exercise_id;
        if (!exerciseDefId) continue;
        currentExerciseIds.add(exerciseDefId);

        const existingId = existingMap.get(exerciseDefId);
        if (existingId) {
          // Update existing template_exercise
          await supabase
            .from('template_exercises')
            .update({
              sets: exercise.sets,
              reps: exercise.reps || 10,
              weight_type: exercise.weight_type || 'lbs',
              order_index: i,
            })
            .eq('id', existingId);
        } else {
          // Insert new template_exercise
          await supabase
            .from('template_exercises')
            .insert({
              template_id: id as string,
              exercise_id: exerciseDefId,
              sets: exercise.sets,
              reps: exercise.reps || 10,
              weight_type: exercise.weight_type || 'lbs',
              order_index: i,
            });
        }
      }

      // Delete removed exercises — ignore FK errors for rows still referenced
      for (const [exerciseId, rowId] of existingMap) {
        if (!currentExerciseIds.has(exerciseId!)) {
          await supabase
            .from('template_exercises')
            .delete()
            .eq('id', rowId)
            .then(({ error }) => {
              if (error) {
                console.warn('Could not delete template exercise (still referenced):', rowId);
              }
            });
        }
      }

      // Invalidate template queries so they refresh
      await queryClient.invalidateQueries({ queryKey: ['exerciseTemplates'] });
    } catch (err) {
      console.error('Failed to update template from workout:', err);
    }
  };

  const handleRemoveExercise = async (exerciseDefId: string) => {
    if (!exerciseTemplate || !workoutSessionId) return;

    // Guard: can't remove the last exercise
    if (exerciseTemplate.length <= 1) {
      setErrorMessage('Cannot remove the last exercise from the workout.');
      setShowErrorDialog(true);
      return;
    }

    // Remove localStorage entry
    const exerciseKey = `workout_${workoutSessionId}_exercise_${exerciseDefId}`;
    localStorage.removeItem(exerciseKey);

    // Remove from store
    removeExerciseFromWorkout(id as string, exerciseDefId);

    // Delete workout_session_exercises row from DB
    await supabase
      .from('workout_session_exercises')
      .delete()
      .eq('workout_session_id', workoutSessionId)
      .eq('exercise_id', exerciseDefId);
  };

  const handleCancelWorkout = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('workout_sessions')
        .update({
          status: 'cancelled',
          end_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (error) {
        setErrorMessage('Failed to cancel workout. Please try again.');
        setShowErrorDialog(true);
        return;
      }

      localStorage.removeItem('current_workout_session');

      router.push('/');
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setShowErrorDialog(true);
    }
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      const session = localStorage.getItem('current_workout_session');
      if (
        session &&
        (JSON.parse(session).status === 'completed' || JSON.parse(session).status === 'cancelled')
      ) {
        localStorage.removeItem('current_workout_session');
      }
    };
  }, []);

  if (!exerciseTemplate) {
    return <div>Loading...</div>;
  }

  const existingExerciseIds = exerciseTemplate
    .map((ex) => ex.exercise_definitions?.id)
    .filter(Boolean) as string[];

  return (
    <>
      <div className="flex flex-col gap-4 p-6 font-bold">
        <div className="flex justify-between items-center">
          {workoutStartTime && <WorkoutTimer startTime={workoutStartTime} />}
          <Button
            onClick={() => setShowFinishDialog(true)}
            variant="outline"
            className="font-bold btn-success"
          >
            Finish
          </Button>
        </div>
        <h2 className="text-2xl font-bold">{exerciseTemplateTitle}</h2>
        <p className="text-sm text-muted-foreground">{exerciseTemplateNotes}</p>
        {exerciseTemplate?.map((exercise) => (
          <ExerciseRows
            key={exercise.id}
            exercises={exercise}
            templateId={id as string}
            onRemoveExercise={handleRemoveExercise}
          />
        ))}

        <Button
          variant="outline"
          className="w-full font-bold"
          onClick={() => setShowAddExerciseDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>

        <div className="flex justify-center mb-4">
          <Button
            className="w-full font-bold"
            variant="destructive"
            onClick={() => setShowCancelDialog(true)}
          >
            Cancel workout
          </Button>
        </div>

        {/* Finish Workout Dialog */}
        <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
          <AlertDialogContent className="w-5/6 bg-popover border-none rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Finish Workout</AlertDialogTitle>
              <AlertDialogDescription>
                How would you like to save your workout?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
              <AlertDialogAction
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => handleFinishWorkout(workoutSessionId!, false)}
              >
                Save Workout Only
              </AlertDialogAction>
              <AlertDialogAction
                className="btn-success bg-green-600 text-white hover:bg-green-700"
                onClick={() => handleFinishWorkout(workoutSessionId!, true)}
              >
                Save &amp; Update Template
              </AlertDialogAction>
              <AlertDialogCancel className="bg-muted text-muted-foreground hover:bg-muted/80">
                Keep Working Out
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={showIncompleteExercisesDialog}
          onOpenChange={setShowIncompleteExercisesDialog}
        >
          <AlertDialogContent className="w-5/6 bg-popover border-none rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Incomplete Exercises</AlertDialogTitle>
              <AlertDialogDescription>
                You have incomplete exercises in your workout. Please complete them before finishing
                the workout.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-primary text-primary-foreground hover:bg-primary/90">
                Keep Working Out
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent className="w-5/6 bg-popover border-none rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Workout?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this workout? This action cannot be undone. All
                progress for this session will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-primary text-primary-foreground hover:bg-primary/90">
                Keep Working Out
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleCancelWorkout(workoutSessionId!)}
              >
                Yes, Cancel Workout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent className="w-5/6 bg-popover border-none rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Error</AlertDialogTitle>
              <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction className="bg-primary text-primary-foreground hover:bg-primary/90">
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {workoutSessionId && (
          <AddWorkoutExerciseDialog
            open={showAddExerciseDialog}
            onOpenChange={setShowAddExerciseDialog}
            templateId={id as string}
            workoutSessionId={workoutSessionId}
            existingExerciseIds={existingExerciseIds}
          />
        )}
      </div>
    </>
  );
};

export default TemplatePage;
