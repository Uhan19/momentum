'use client';

import { memo, useEffect, useState } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface WorkoutTimerProps {
  startTime: string;
}

export const WorkoutTimer = memo(({ startTime }: WorkoutTimerProps) => {
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  useEffect(() => {
    const updateTimer = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;

      // Convert to HH:MM:SS
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      setElapsedTime(formattedTime);
    };

    // Update immediately and then every second
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime]); // Only re-run effect if startTime changes

  return (
    <div className="flex items-center gap-2 text-lg font-mono">
      <TimerIcon className="h-5 w-5" />
      <span>{elapsedTime}</span>
    </div>
  );
});

WorkoutTimer.displayName = 'WorkoutTimer';
