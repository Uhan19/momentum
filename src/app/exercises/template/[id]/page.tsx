'use client';

import { useEffect, useState } from 'react';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';
import { ExerciseRows } from '@/app/components/exercise-groups/exercise-rows';
import { Button } from '@/components/ui/button';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Timer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

const TemplatePage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const workoutSessionId = searchParams.get('session');
  const exerciseTemplate = useExerciseTemplateStore(
    (state) => state.exerciseTemplates[id as string],
  );
  const exerciseTemplateTitle = useExerciseTemplateStore((state) => state.exerciseTemplateTitle);
  const exerciseTemplateNotes = useExerciseTemplateStore((state) => state.exerciseTemplateNotes);
  console.log('exerciseTemplate', exerciseTemplate);

  useEffect(() => {
    // Check for session ID in URL
    if (!workoutSessionId) {
      // Try to recover from localStorage
      const savedSession = localStorage.getItem('current_workout_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.templateId === id) {
          // Redirect to the saved session
          router.push(`/exercises/template/${id}?session=${session.sessionId}`);
        } else {
          // Handle case where template ID doesn't match
          console.warn('Saved session is for a different template');
          localStorage.removeItem('current_workout_session');
        }
      }
    }
  }, [workoutSessionId, id, router]);

  const handleFinishWorkout = async (sessionId: string) => {
    try {
      // Update workout session status
      await supabase
        .from('workout_sessions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      // Clear the localStorage
      localStorage.removeItem('current_workout_session');

      // Navigate away or show completion screen
      router.push('/workout-complete'); // or wherever you want to go
    } catch (error) {
      console.error('Error finishing workout:', error);
    }
  };

  const handleCancelWorkout = async (sessionId: string) => {
    try {
      // Update workout session status
      await supabase
        .from('workout_sessions')
        .update({
          status: 'cancelled',
          end_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      // Clear the localStorage
      localStorage.removeItem('current_workout_session');

      // Navigate back to templates or home
      router.push('/dashboard');
    } catch (error) {
      console.error('Error cancelling workout:', error);
    }
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      // Optionally: Only clear if the session is marked as completed or cancelled
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

  return (
    <div className="flex flex-col gap-4 p-6 font-bold">
      <div className="flex justify-between">
        <Timer />
        <Button
          onClick={() => handleFinishWorkout(workoutSessionId)}
          variant="outline"
          className="font-bold btn-success"
        >
          Finish
        </Button>
      </div>
      <h2 className="text-2xl font-bold">{exerciseTemplateTitle}</h2>
      <p className="text-sm text-muted-foreground">{exerciseTemplateNotes}</p>
      {exerciseTemplate?.map((exercise) => <ExerciseRows key={exercise.id} exercises={exercise} />)}
      <div className="flex justify-center mb-4">
        <Button
          className="w-full font-bold"
          variant="destructive"
          onClick={() => setShowCancelDialog(true)}
        >
          Cancel workout
        </Button>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this workout? This action cannot be undone. All
              progress for this session will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Working Out</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => handleCancelWorkout(workoutSessionId!)}
            >
              Yes, Cancel Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TemplatePage;
