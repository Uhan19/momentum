'use client';

import { useEffect } from 'react';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';
import { ExerciseRows } from '@/app/components/exercise-groups/exercise-rows';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

const TemplatePage = () => {
  const { id } = useParams();
  const exerciseTemplate = useExerciseTemplateStore(
    (state) => state.exerciseTemplates[id as string],
  );
  console.log('exerciseTemplate', exerciseTemplate);

  // useEffect(() => {
  //   // Check what's in localStorage when the page loads
  //   console.log('Page Load - LocalStorage:', localStorage.getItem('exercise-template-storage'));
  //   console.log('Page Load - Exercise Template:', exerciseTemplate);
  // }, []);

  if (!exerciseTemplate) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {exerciseTemplate?.map((exercise) => <ExerciseRows key={exercise.id} exercises={exercise} />)}
      <div className="flex justify-center px-4 mb-4">
        <Button className="w-full" variant="destructive">
          Cancel workout
        </Button>
      </div>
    </div>
  );
};

export default TemplatePage;
