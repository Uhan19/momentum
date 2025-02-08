'use client';

import { DashboardHeader } from './dashboard-header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
