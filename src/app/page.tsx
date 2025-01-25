import { WorkoutCard } from './components/workout-card';

export default function Home() {
  return (
    <div className="min-h-screen p-4 pb-20 sm:p-8 md:p-20 font-[family-name:var(--font-font-geist-sans)]">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center">Momentum</h1>
      </header>
      <main className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        <WorkoutCard title="A11111" />
        <WorkoutCard title="A2" />
        <WorkoutCard title="B1" />
        <WorkoutCard title="B2" />
      </main>
    </div>
  );
}
