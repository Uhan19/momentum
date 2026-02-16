'use client';

import { create } from 'zustand';
import {
  TemplateExercisesWithDefinitionsArray,
  TemplateExerciseWithDefinition,
} from '@/types';

interface ExerciseTemplateStore {
  exerciseTemplates: {
    [key: string]: TemplateExercisesWithDefinitionsArray;
  };
  exerciseTemplateTitle: string;
  exerciseTemplateNotes: string;
  setExerciseTemplateTitle: (title: string) => void;
  setExerciseTemplateNotes: (notes: string) => void;
  setExerciseTemplate: (id: string, exercises: TemplateExercisesWithDefinitionsArray) => void;
  addSetToExercise: (templateId: string, exerciseDefId: string) => void;
  removeSetFromExercise: (templateId: string, exerciseDefId: string) => void;
  addExerciseToWorkout: (templateId: string, exercise: TemplateExerciseWithDefinition) => void;
  removeExerciseFromWorkout: (templateId: string, exerciseDefId: string) => void;
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
  addSetToExercise: (templateId, exerciseDefId) => {
    set((state) => {
      const exercises = state.exerciseTemplates[templateId];
      if (!exercises) return state;
      return {
        exerciseTemplates: {
          ...state.exerciseTemplates,
          [templateId]: exercises.map((ex) =>
            ex.exercise_definitions?.id === exerciseDefId
              ? { ...ex, sets: ex.sets + 1 }
              : ex,
          ),
        },
      };
    });
  },
  removeSetFromExercise: (templateId, exerciseDefId) => {
    set((state) => {
      const exercises = state.exerciseTemplates[templateId];
      if (!exercises) return state;
      return {
        exerciseTemplates: {
          ...state.exerciseTemplates,
          [templateId]: exercises.map((ex) =>
            ex.exercise_definitions?.id === exerciseDefId && ex.sets > 1
              ? { ...ex, sets: ex.sets - 1 }
              : ex,
          ),
        },
      };
    });
  },
  addExerciseToWorkout: (templateId, exercise) => {
    set((state) => {
      const exercises = state.exerciseTemplates[templateId] || [];
      return {
        exerciseTemplates: {
          ...state.exerciseTemplates,
          [templateId]: [...exercises, exercise],
        },
      };
    });
  },
  removeExerciseFromWorkout: (templateId, exerciseDefId) => {
    set((state) => {
      const exercises = state.exerciseTemplates[templateId];
      if (!exercises) return state;
      return {
        exerciseTemplates: {
          ...state.exerciseTemplates,
          [templateId]: exercises.filter(
            (ex) => ex.exercise_definitions?.id !== exerciseDefId,
          ),
        },
      };
    });
  },
}));
