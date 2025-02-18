'use client';

import { Footer } from './components/footer/footer';
import { ExerciseGroupsList } from '@/app/components/exercise-groups/exercise-groups-list';
import { DashboardHeader } from './components/dashboard/dashboard-header';
import { DashboardSidebar } from './components/dashboard/dashboard-sidebar';
import { useState } from 'react';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-font-geist-sans)]">
      <DashboardHeader setIsOpen={setIsOpen} />
      <main className="flex-1">
        <DashboardSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <ExerciseGroupsList />
        <Footer />
      </main>
    </div>
  );
}
