'use client';

import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { WorkoutCard } from '@/app/components/history/workout-card';
import { WorkoutSessionWithDetails } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';
import { AuthenticatedLayout } from '@/app/components/layout/authenticated-layout';

export default function HistoryPage() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const { data: completedWorkouts, error } = await supabase
        .from('workout_sessions')
        .select(
          `
          *,
          exercise_templates!inner (
            id,
            title,
            notes
          ),
          workout_session_exercises (
            *,
            exercise_definitions!inner (
              id,
              name,
              description
            ),
            exercise_sets (
              *
            )
          )
        `,
        )
        .eq('status', 'completed')
        .order('start_time', { ascending: false });

      if (error) throw error;
      return completedWorkouts as WorkoutSessionWithDetails[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Group workouts by month
  const groupedWorkouts = history?.reduce((groups, workout) => {
    const monthKey = workout.start_time
      ? format(new Date(workout.start_time), 'MMMM yyyy')
      : 'Unknown';

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(workout);
    return groups;
  }, {} as Record<string, WorkoutSessionWithDetails[]>);

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-6 max-w-lg">
          <h1 className="text-3xl font-bold mb-8">History</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-muted rounded-xl"></div>
            <div className="h-40 bg-muted rounded-xl"></div>
            <div className="h-40 bg-muted rounded-xl"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!history || history.length === 0) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-6 max-w-lg">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">History</h1>
            <Link
              href="/history/calendar"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-sm font-medium">Calendar</span>
            </Link>
          </div>
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No completed workouts yet.</p>
            <p className="text-muted-foreground/70 mt-2">Complete your first workout to see it here!</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">History</h1>
          <Link
            href="/history/calendar"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-sm font-medium">Calendar</span>
          </Link>
        </div>

        {Object.entries(groupedWorkouts || {}).map(([month, workouts]) => (
          <div key={month} className="mb-8">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {month}
            </h2>
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        ))}
      </div>
    </AuthenticatedLayout>
  );
}
