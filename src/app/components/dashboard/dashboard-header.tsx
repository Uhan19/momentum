'use client';

import { useSupabase } from '@/providers/supabase-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Menu } from 'lucide-react';
import { ModeToggle } from './mode-toggle';

export const DashboardHeader = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }) => {
  const { supabase } = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleOpenSidebar = () => {
    setIsOpen(true);
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-2">
        <Button variant="ghost" onClick={handleOpenSidebar}>
          <Menu className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold ml-4">Momentum</h2>
        <div className="ml-auto flex items-center">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative">
                <div className="flex h-8 w-8 items-center rounded-full justify-center bg-muted">
                  <User className="h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
