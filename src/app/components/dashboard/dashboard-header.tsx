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
import { User } from 'lucide-react';

export function DashboardHeader() {
  const { supabase, user } = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };
  console.log('user', user);
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-2">
        <h2 className="text-2xl font-bold ml-4">Momentum</h2>
        <div className="ml-auto flex items-center">
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
}
