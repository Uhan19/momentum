'use client';

import { ExerciseGroupsList } from '@/app/components/exercise-groups/exercise-groups-list';
import { AuthenticatedLayout } from '@/app/components/layout/authenticated-layout';

export default function Home() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Start a workout</h1>
        <ExerciseGroupsList />
      </div>
    </AuthenticatedLayout>
  );
}
