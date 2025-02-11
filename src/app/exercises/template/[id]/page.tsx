'use client';

import { useEffect } from 'react';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';
import { ExerciseRows } from '@/app/components/exercise-groups/exercise-rows';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { Timer } from 'lucide-react';

const TemplatePage = () => {
  const { id } = useParams();
  const exerciseTemplate = useExerciseTemplateStore(
    (state) => state.exerciseTemplates[id as string],
  );
  const exerciseTemplateTitle = useExerciseTemplateStore((state) => state.exerciseTemplateTitle);
  const exerciseTemplateNotes = useExerciseTemplateStore((state) => state.exerciseTemplateNotes);
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
    <div className="flex flex-col gap-4 p-6 font-bold">
      <div className="flex justify-between">
        <Timer />
        <Button variant="outline" className="font-bold btn-success">
          Finish
        </Button>
      </div>
      <h2 className="text-2xl font-bold">{exerciseTemplateTitle}</h2>
      <p className="text-sm text-muted-foreground">{exerciseTemplateNotes}</p>
      {exerciseTemplate?.map((exercise) => <ExerciseRows key={exercise.id} exercises={exercise} />)}
      <div className="flex justify-center mb-4">
        <Button className="w-full font-bold" variant="destructive">
          Cancel workout
        </Button>
      </div>
    </div>
  );
};

export default TemplatePage;
