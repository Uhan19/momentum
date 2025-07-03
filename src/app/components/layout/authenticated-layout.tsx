'use client';

import { BottomNav } from '@/app/components/navigation/bottom-nav';
import { AppHeader } from './app-header';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      {children}
      <BottomNav />
    </div>
  );
}