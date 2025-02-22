import { Header } from './components/header/header';
import { StartWorkout } from './components/workout/start-workout';

export default function Home() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-font-geist-sans)]">
      <Header />
      <main>
        <StartWorkout />
      </main>
    </div>
  );
}
