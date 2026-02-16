import { BestSet } from '@/types';

interface ExerciseListItemProps {
  exerciseName: string;
  completedSets: number;
  bestSet: BestSet | null;
}

export function ExerciseListItem({
  exerciseName,
  completedSets,
  bestSet
}: ExerciseListItemProps) {
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <div className="flex-1">
        <span className="text-sm">
          {completedSets} × {exerciseName}
        </span>
      </div>
      <div className="text-sm text-muted-foreground">
        {bestSet ? (
          <span className="font-medium">{bestSet.weight} {bestSet.weightType} × {bestSet.reps}</span>
        ) : (
          <span>-</span>
        )}
      </div>
    </div>
  );
}