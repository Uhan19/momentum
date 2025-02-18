import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Dumbbell, Play } from 'lucide-react';
import { TemplateExercisesWithDefinitionsArray } from '@/types';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface WorkoutSessionStorage {
  sessionId: string;
  templateId: string;
  startTime: string;
  // TODO: Add `pause` later
  status: 'in_progress';
}

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
  const setExerciseTemplateTitle = useExerciseTemplateStore(
    (state) => state.setExerciseTemplateTitle,
  );
  const setExerciseTemplateNotes = useExerciseTemplateStore(
    (state) => state.setExerciseTemplateNotes,
  );

  useEffect(() => {
    if (templateExerciseAndDefinition) {
      setExerciseTemplate(id, templateExerciseAndDefinition);
      setExerciseTemplateTitle(title);
      setExerciseTemplateNotes(notes);
    }
  }, [
    setExerciseTemplate,
    setExerciseTemplateTitle,
    setExerciseTemplateNotes,
    templateExerciseAndDefinition,
    id,
    title,
    notes,
  ]);

  const handleStartWorkout = async () => {
    try {
      // Check if there's an existing workout session for this template
      const existingSession = localStorage.getItem('current_workout_session');
      if (existingSession) {
        const session = JSON.parse(existingSession) as WorkoutSessionStorage;
        // Redirect to existing session
        router.push(`/exercises/template/${session.templateId}?session=${session.sessionId}`);
        return;
      }

      // Create the workout session
      const { data: workoutSession, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          template_id: id,
          status: 'in_progress',
        })
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      // Save the workout session to local storage
      const sessionStorage: WorkoutSessionStorage = {
        sessionId: workoutSession.id,
        templateId: id,
        startTime: new Date().toISOString(),
        status: 'in_progress',
      };
      localStorage.setItem('current_workout_session', JSON.stringify(sessionStorage));

      // Create the workout session exercises
      const workoutExercises = templateExerciseAndDefinition.map((exercise) => ({
        workout_session_id: workoutSession.id,
        exercise_id: exercise.exercise_definitions.id,
        planned_sets: exercise.sets,
        planned_reps: exercise.reps,
        is_template_exercise: true,
        template_exercise_id: exercise.id,
        order_index: exercise.order_index || 0,
      }));

      const { error: exerciseError } = await supabase
        .from('workout_session_exercises')
        .insert(workoutExercises);

      if (exerciseError) {
        throw exerciseError;
      }

      router.push(`/exercises/template/${id}?session=${workoutSession.id}`);
    } catch (error) {
      console.error('Error starting workout', error);
    }
  };

  return (
    <div>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            className="h-10 w-25 mr-6 btn-success"
            variant="secondary"
            onClick={() => setOpen(true)}
          >
            <span className="font-bold">Preview</span>
            <Dumbbell />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="p-0 mb-8 border-none rounded-md w-full">
          <DrawerHeader className="flex flex-col gap-2 items-start p-4">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{notes}</DrawerDescription>
          </DrawerHeader>
          {templateExerciseAndDefinition?.map((exercise) => {
            const { sets, reps, exercise_definitions } = exercise;
            const { name, description } = exercise_definitions;
            return (
              <div className="flex flex-col px-4" key={exercise.id}>
                <h1 className="font-bold exercise-name">{name}</h1>
                <p>{description}</p>
                <p className="italic">
                  {sets} sets of {reps} reps
                </p>
              </div>
            );
          })}
          <div className="flex justify-center px-4 mb-4">
            <Button
              className="w-full mr-6 mt-4 btn-success"
              variant="secondary"
              onClick={() => handleStartWorkout()}
            >
              <Play />
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
