'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';
import { useSupabase } from '@/providers/supabase-provider';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableExerciseItem } from './sortable-exercise-item';
import { AddExerciseDialog } from './add-exercise-dialog';
import { TemplateExercisesWithDefinitionsArray } from '@/types';
import { useExercises } from '@/hooks/useExercises';
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

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  notes: z.string().optional(),
  exercises: z.array(
    z.object({
      id: z.string().optional(), // Existing exercises will have an id
      exercise_id: z.string(),
      sets: z.coerce.number().min(1, 'Must have at least 1 set'),
      reps: z.coerce.number().min(1, 'Must have at least 1 rep'),
      weight_type: z.enum(['kg', 'lbs']),
      order_index: z.number(),
    }),
  ),
});

export type FormValues = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
  title: string;
  notes: string;
  exercises: TemplateExercisesWithDefinitionsArray;
  groupId: string;
};

export function EditExerciseTemplateDialog({
  open,
  onOpenChange,
  templateId,
  title,
  notes,
  exercises,
  groupId,
}: Props) {
  const [openAddExerciseDialog, setOpenAddExerciseDialog] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);
  const [exercisesToDelete, setExercisesToDelete] = useState<string[]>([]);
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      notes: '',
      exercises: [],
    },
  });

  // Fetch available exercises (both system and custom)
  const { data: availableExercises = [] } = useExercises();

  // Initialize form with existing data
  useEffect(() => {
    if (open && exercises) {
      form.reset({
        title,
        notes: notes || '',
        exercises: exercises.map((ex, index) => ({
          id: ex.id,
          exercise_id: ex.exercise_id || '',
          sets: ex.sets,
          reps: ex.reps || 0,
          weight_type: (ex.weight_type as 'kg' | 'lbs') || 'lbs',
          order_index: ex.order_index || index,
        })),
      });
    }
  }, [open, title, notes, exercises, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(fields, oldIndex, newIndex);
      // Update order_index for each item
      newOrder.forEach((item, index) => {
        form.setValue(`exercises.${index}.order_index`, index);
      });
    }
  };

  const handleRemove = (index: number) => {
    const exercise = form.getValues(`exercises.${index}`);
    if (exercise.id) {
      // This is an existing exercise, add to delete list
      setExercisesToDelete([...exercisesToDelete, exercise.id]);
    }
    remove(index);
    setDeleteConfirmIndex(null);
  };

  async function onSubmit(values: FormValues) {
    try {
      // Update the template
      const { error: templateError } = await supabase
        .from('exercise_templates')
        .update({
          title: values.title,
          notes: values.notes,
        })
        .eq('id', templateId);

      if (templateError) throw templateError;

      // Delete removed exercises
      if (exercisesToDelete.length > 0) {
        // First check if any of these exercises are being used in workout sessions
        const { data: usedExercises, error: checkError } = await supabase
          .from('workout_session_exercises')
          .select('template_exercise_id')
          .in('template_exercise_id', exercisesToDelete);

        if (checkError) throw checkError;

        if (usedExercises && usedExercises.length > 0) {
          // Some exercises are in use, we can't delete them
          // Instead, we'll just update the template without deleting
          console.warn('Cannot delete exercises that are being used in workout sessions');
          alert('Some exercises cannot be deleted because they are being used in workout sessions.');
          // Clear the delete list for these exercises
          const usedIds = usedExercises.map(e => e.template_exercise_id);
          setExercisesToDelete(exercisesToDelete.filter(id => !usedIds.includes(id)));
        } else {
          // Safe to delete
          const { error: deleteError } = await supabase
            .from('template_exercises')
            .delete()
            .in('id', exercisesToDelete);

          if (deleteError) throw deleteError;
        }
      }

      // Update existing and create new exercises
      const existingExercises = values.exercises.filter((ex) => ex.id);
      const newExercises = values.exercises.filter((ex) => !ex.id);

      // Update existing exercises
      for (const exercise of existingExercises) {
        const { id, ...updateData } = exercise;
        const { error } = await supabase.from('template_exercises').update(updateData).eq('id', id);

        if (error) throw error;
      }

      // Create new exercises
      if (newExercises.length > 0) {
        const { error } = await supabase.from('template_exercises').insert(
          newExercises.map((exercise) => ({
            template_id: templateId,
            ...exercise,
          })),
        );

        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['exerciseTemplates', groupId] });

      onOpenChange(false);
      setExercisesToDelete([]);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit exercise template</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chest Day" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Focus on form and controlled movements"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel>Exercises</FormLabel>
                  <AddExerciseDialog
                    fields={fields}
                    append={append}
                    openAddExerciseDialog={openAddExerciseDialog}
                    setOpenAddExerciseDialog={setOpenAddExerciseDialog}
                  />
                </div>

                {/* Column Headers - Only show on desktop */}
                <div className="hidden sm:flex gap-4 px-4 text-sm font-medium text-muted-foreground">
                  <div className="w-8"></div>
                  <div className="flex-1">Exercise</div>
                  <div className="w-20 text-center">Sets</div>
                  <div className="w-20 text-center">Reps</div>
                  <div className="w-24 text-center">Unit</div>
                  <div className="w-8"></div>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((field) => field.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {fields.map((field, index) => (
                        <SortableExerciseItem
                          key={field.id}
                          id={field.id}
                          index={index}
                          exercises={availableExercises}
                          remove={(idx) => setDeleteConfirmIndex(idx)}
                          form={form}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              <DialogFooter className="sm:justify-end">
                <Button type="submit" className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirmIndex !== null}
        onOpenChange={() => setDeleteConfirmIndex(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exercise?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this exercise from the template? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmIndex !== null && handleRemove(deleteConfirmIndex)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
