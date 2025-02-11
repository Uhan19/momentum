'use client';

import { create } from 'zustand';
import { TemplateExercisesWithDefinitionsArray } from '@/types';

interface ExerciseTemplateStore {
  exerciseTemplates: {
    [key: string]: TemplateExercisesWithDefinitionsArray;
  };
  exerciseTemplateTitle: string;
  exerciseTemplateNotes: string;
  setExerciseTemplateTitle: (title: string) => void;
  setExerciseTemplateNotes: (notes: string) => void;
  setExerciseTemplate: (id: string, exercises: TemplateExercisesWithDefinitionsArray) => void;
}

export const useExerciseTemplateStore = create<ExerciseTemplateStore>()((set) => ({
  exerciseTemplates: {},
  exerciseTemplateTitle: '',
  exerciseTemplateNotes: '',
  setExerciseTemplateTitle: (title: string) => {
    set({ exerciseTemplateTitle: title });
  },
  setExerciseTemplateNotes: (notes: string) => {
    set({ exerciseTemplateNotes: notes });
  },
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
