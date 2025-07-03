import { AuthenticatedLayout } from '@/app/components/layout/authenticated-layout';

export default function ExercisesPage() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <h1 className="text-3xl font-bold mb-6">Exercises</h1>
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Exercise library coming soon!</p>
          <p className="text-muted-foreground/70 mt-2">Browse and search all available exercises.</p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}