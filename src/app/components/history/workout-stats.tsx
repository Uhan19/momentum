import { Clock, Weight, Trophy } from 'lucide-react';

interface WorkoutStatsProps {
  duration: number; // in minutes
  totalWeight: number;
  prs?: number;
}

export function WorkoutStats({ duration, totalWeight, prs = 0 }: WorkoutStatsProps) {
  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Format weight with commas
  const formatWeight = (weight: number) => {
    return weight.toLocaleString();
  };

  return (
    <div className="flex items-center gap-5 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span className="font-medium">{formatDuration(duration)}</span>
      </div>
      <div className="flex items-center gap-2">
        <Weight className="h-4 w-4" />
        <span className="font-medium">{formatWeight(totalWeight)} lb</span>
      </div>
      {prs > 0 && (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
          <span className="font-medium">{prs} PRs</span>
        </div>
      )}
    </div>
  );
}