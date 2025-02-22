'use client';

import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Trash } from 'lucide-react';
import { useState } from 'react';
import { CreateExerciseGroupDialog } from './create-exercise-group-dialog';
import { useSupabase } from '@/providers/supabase-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateExerciseTemplateDialog } from '../exercise-templates/create-exercise-template-dialog';
import { ExerciseTemplates } from './exercise-templates';

type ExerciseGroup = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export function ExerciseGroupsList() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<ExerciseGroup | null>(null);
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false);

  const { data: exerciseGroups, isLoading } = useQuery({
    queryKey: ['exerciseGroups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExerciseGroup[];
    },
  });

  const handleDelete = async () => {
    if (!groupToDelete) return;

    try {
      const { error } = await supabase.from('exercise_groups').delete().eq('id', groupToDelete.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['exerciseGroups'] });
      setGroupToDelete(null);
    } catch (error) {
      console.error('Error deleting exercise group:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Templates</h1>
        <Button variant="outline" size="icon" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Accordion
          type="multiple"
          className="w-full space-y-4"
          onValueChange={(values) => {
            const lastValue = values[values.length - 1];
            setSelectedGroupId(lastValue || null);
          }}
        >
          {exerciseGroups?.map((group) => (
            <AccordionItem key={group.id} value={group.id} className="border rounded-lg">
              <div className="flex items-center justify-between">
                <AccordionTrigger className="px-4 flex-1">
                  <div className="flex flex-col items-start">
                    <div className="text-lg font-semibold">{group.name}</div>
                    {group.description && (
                      <div className="text-sm text-muted-foreground">{group.description}</div>
                    )}
                  </div>
                </AccordionTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setGroupToDelete(group)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <AccordionContent className="px-4">
                <div className="py-4">
                  <ExerciseTemplates selectedGroupId={selectedGroupId} />
                  <Button
                    className="w-full mt-4 bg-transparent border-2 rounded-full border-seamaster-green text-seamaster-green hover:bg-seamaster-green/20 hover:text-white dark:border-white dark:text-white"
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setShowCreateTemplateDialog(true);
                    }}
                  >
                    Add template
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <CreateExerciseGroupDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      <AlertDialog open={!!groupToDelete} onOpenChange={() => setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the exercise group &quot;{groupToDelete?.name}&quot; and
              all its exercises. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedGroupId && (
        <CreateExerciseTemplateDialog
          open={showCreateTemplateDialog}
          onOpenChange={setShowCreateTemplateDialog}
          groupId={selectedGroupId}
        />
      )}
    </div>
  );
}
