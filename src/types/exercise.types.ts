import { FieldArrayWithId } from 'react-hook-form';
import { Database } from './supabase.types';

export type TemplateExercise = Database['public']['Tables']['template_exercises']['Row'];
export type ExerciseDefinition = Database['public']['Tables']['exercise_definitions']['Row'];

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
