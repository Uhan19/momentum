import { TemplateExerciseWithDefinition } from '@/types';

export const ExerciseDefinitions = ({ exercise }: { exercise: TemplateExerciseWithDefinition }) => {
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
};
