import { FieldArrayWithId } from 'react-hook-form';
import { Database } from './supabase.types';

export type TemplateExercise = Database['public']['Tables']['template_exercises']['Row'];
export type ExerciseDefinition = Database['public']['Tables']['exercise_definitions']['Row'];
export type ExerciseTemplate = Database['public']['Tables']['exercise_templates']['Row'];
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type WorkoutSessionExercise = Database['public']['Tables']['workout_session_exercises']['Row'];
export type ExerciseSet = Database['public']['Tables']['exercise_sets']['Row'];

// Renamed to avoid confusion and better represent the data structure
export interface TemplateExerciseWithDefinition extends TemplateExercise {
  exercise_definitions: ExerciseDefinition;
}

// If you're working with an array of these
export type TemplateExercisesWithDefinitionsArray = TemplateExerciseWithDefinition[];

export type ExerciseFields = FieldArrayWithId<
  {
    exercises: {
      exercise_id: string;
      sets: number;
      reps: number;
      weight_type: 'kg' | 'lbs';
      order_index: number;
    }[];
    title: string;
    notes?: string | undefined;
  },
  'exercises',
  'id'
>[];

// History page types
export interface WorkoutSessionWithDetails extends WorkoutSession {
  exercise_templates: ExerciseTemplate;
  workout_session_exercises: WorkoutSessionExerciseWithDetails[];
}

export interface WorkoutSessionExerciseWithDetails extends WorkoutSessionExercise {
  exercise_definitions: ExerciseDefinition;
  exercise_sets: ExerciseSet[];
}

export interface BestSet {
  weight: number;
  reps: number;
  weightType?: string;
}

export type WorkoutStatus = 'in_progress' | 'completed' | 'cancelled';

export interface SetData {
  weight: number;
  reps: number;
  completed: boolean;
}
