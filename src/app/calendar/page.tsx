import { AuthenticatedLayout } from '@/app/components/layout/authenticated-layout';
import { Calendar } from 'lucide-react';

export default function CalendarPage() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <h1 className="text-3xl font-bold mb-6">Calendar</h1>
        <div className="text-center py-20">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">Calendar view coming soon!</p>
          <p className="text-muted-foreground/70 mt-2">Track your workout schedule and progress over time.</p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}