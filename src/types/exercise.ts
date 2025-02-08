import { FieldArrayWithId } from 'react-hook-form'

export interface ExerciseDefinition {
  id: string
  name: string
}

export type ExerciseFields = FieldArrayWithId<
  {
    exercises: {
      exercise_id: string
      sets: number
      reps: number
      weight_type: 'kg' | 'lbs'
      order_index: number
    }[]
    title: string
    notes?: string | undefined
  },
  'exercises',
  'id'
>[]
