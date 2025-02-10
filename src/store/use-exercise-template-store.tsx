'use client';

import { create } from 'zustand';
import { TemplateExercisesWithDefinitionsArray } from '@/types';

interface ExerciseTemplateStore {
  exerciseTemplates: {
    [key: string]: TemplateExercisesWithDefinitionsArray;
  };
  setExerciseTemplate: (id: string, exercises: TemplateExercisesWithDefinitionsArray) => void;
}

export const useExerciseTemplateStore = create<ExerciseTemplateStore>()((set) => ({
  exerciseTemplates: {},
  setExerciseTemplate: (id, exercises) => {
    console.log('Setting exercise template:', { id, exercises });
    set((state) => ({
      exerciseTemplates: {
        ...state.exerciseTemplates,
        [id]: exercises,
      },
    }));
  },
}));
