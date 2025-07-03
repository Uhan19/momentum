'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, History, Home, Plus, Dumbbell, Calendar } from 'lucide-react';

const navigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'History', href: '/history', icon: History },
  { name: 'Home', href: '/', icon: Home, isCenter: true },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Exercises', href: '/exercises', icon: Dumbbell },
];

export function BottomNav() {
  const pathname = usePathname();

  // Don't show bottom nav on auth pages or exercise template pages
  if (pathname.startsWith('/auth') || pathname.includes('/exercises/template/')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t">
      <div className="flex items-center justify-around h-20 relative">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/' && pathname === '/') ||
            (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-2 text-xs transition-all',
                item.isCenter ? 'relative' : '',
                isActive && !item.isCenter
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.isCenter ? (
                <div className="items-center justify-center">
                  <div
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-lg',
                      isActive
                        ? 'bg-primary text-primary-foreground scale-100'
                        : 'bg-muted hover:bg-accent text-foreground',
                    )}
                  >
                    <Plus className="h-6 w-6" />
                  </div>
                </div>
              ) : (
                <>
                  <item.icon
                    className={cn('h-5 w-5 mb-1 transition-all', isActive && 'scale-110')}
                  />
                  <span className={cn('font-medium transition-all', isActive && 'font-semibold')}>
                    {item.name}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
