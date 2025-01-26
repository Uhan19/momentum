import { ExerciseGroupsList } from '@/app/components/exercise-groups/exercise-groups-list';
import { DashboardLayout } from '@/app/components/dashboard/dashboard-layout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <ExerciseGroupsList />
    </DashboardLayout>
  );
}
