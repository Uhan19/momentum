import { WorkoutCard } from './workout-card';

export const StartWorkout = () => {
  return (
    <div className="grid grid-cols-2 gap-6 sm:gap-8 p-2">
      <WorkoutCard title="A11111" />
      <WorkoutCard title="A2" />
      <WorkoutCard title="B1" />
      <WorkoutCard title="B2" />
    </div>
  );
};
