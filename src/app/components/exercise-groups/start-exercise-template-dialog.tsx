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
import { Dumbbell, Play, X, HelpCircle } from 'lucide-react';
import { TemplateExercisesWithDefinitionsArray } from '@/types';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { getMuscleGroup } from '@/lib/exercise-utils';
import { EditExerciseTemplateDialog } from '../exercise-templates/edit-exercise-template-dialog';
import { useQueryClient } from '@tanstack/react-query';

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
  groupId?: string;
}

export const StartExerciseTemplateDialog = ({
  id,
  title,
  notes,
  templateExerciseAndDefinition,
  groupId = '',
}: StartExerciseTemplateDialogProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [lastPerformed, setLastPerformed] = useState<string | null>(null);
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

  // Fetch last performed date
  useEffect(() => {
    const fetchLastPerformed = async () => {
      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('end_time')
          .eq('template_id', id)
          .eq('status', 'completed')
          .order('end_time', { ascending: false })
          .limit(1);

        if (data && data.length > 0 && data[0].end_time && !error) {
          setLastPerformed(formatDistanceToNow(new Date(data[0].end_time), { addSuffix: true }));
        }
      } catch (err) {
        // No previous workout found, which is fine
        console.error(err);
      }
    };

    if (open && id) {
      fetchLastPerformed();
    }
  }, [open, id]);

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
      const workoutExercises = templateExerciseAndDefinition
        .filter((exercise) => exercise.exercise_definitions?.id) // Only include exercises with valid definitions
        .map((exercise) => ({
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
    <>
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
        <DrawerContent className="max-h-[90vh] bg-background">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>Workout template preview</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
              <div className="flex items-center justify-between p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">{title}</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-orange-500 hover:text-orange-600"
                  onClick={() => {
                    setOpen(false);
                    setShowEditDialog(true);
                  }}
                >
                  Edit
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Last performed info */}
              {lastPerformed && (
                <div className="text-sm text-muted-foreground">Last Performed: {lastPerformed}</div>
              )}

              {/* Quick summary */}
              {notes && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {String(notes)
                    .split('\n')
                    .map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                </div>
              )}

              {/* Exercises list */}
              <div className="space-y-4">
                {console.log('Template exercises:', templateExerciseAndDefinition)}
                {templateExerciseAndDefinition?.map((exercise) => {
                  const { sets } = exercise;
                  const exercise_definitions = exercise.exercise_definitions;
                  
                  // Skip exercises without definitions
                  if (!exercise_definitions || !exercise_definitions.name) {
                    console.warn('Exercise without definition found:', exercise);
                    return null;
                  }
                  
                  const { name } = exercise_definitions;
                  const muscleGroup = getMuscleGroup(name);

                  return (
                    <div className="flex items-center gap-4 py-3" key={exercise.id}>
                      {/* Exercise icon placeholder */}
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Dumbbell className="h-6 w-6 text-muted-foreground" />
                      </div>

                      {/* Exercise info */}
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {sets} × {name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{muscleGroup.group}</p>
                      </div>

                      {/* Help icon */}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-5 w-5 text-orange-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Start workout button */}
              <Button
                className="w-full mt-4 btn-success"
                variant="secondary"
                onClick={handleStartWorkout}
              >
                <Play className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      
      <EditExerciseTemplateDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        templateId={id}
        title={title}
        notes={notes}
        exercises={templateExerciseAndDefinition}
        groupId={groupId}
      />
    </>
  );
};
