'use client'

import { useSupabase } from '@/providers/supabase-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardHeader() {
  const { supabase, user } = useSupabase()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }
  console.log('user', user)
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <h2 className="text-2xl font-bold">Momentum</h2>
        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-4 w-4 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <span className="text-sm font-medium">{user?.email?.[0].toUpperCase()}</span>
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
  )
}
