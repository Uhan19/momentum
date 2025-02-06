'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import { useSupabase } from '@/providers/supabase-provider'
import { useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableExerciseItem } from './sortable-exercise-item'
import { AddExerciseDialog } from './add-exercise-dialog'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  notes: z.string().optional(),
  exercises: z.array(
    z.object({
      exercise_id: z.string(),
      sets: z.coerce.number().min(1, 'Must have at least 1 set'),
      reps: z.coerce.number().min(1, 'Must have at least 1 rep'),
      weight_type: z.enum(['kg', 'lbs']),
      order_index: z.number(),
    }),
  ),
})

export type FormValues = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
}

export function CreateExerciseTemplateDialog({ open, onOpenChange, groupId }: Props) {
  const [openAddExerciseDialog, setOpenAddExerciseDialog] = useState(false)
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      notes: '',
      exercises: [], // Initialize empty array
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises',
  })

  // Add exercise handler
  const handleAddExercise = () => {
    append({
      exercise_id: '',
      sets: 3,
      reps: 10,
      weight_type: 'kg',
      order_index: fields.length,
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id)
      const newIndex = fields.findIndex((item) => item.id === over.id)

      const newOrder = arrayMove(fields, oldIndex, newIndex)
      // Update order_index for each item
      newOrder.forEach((item, index) => {
        form.setValue(`exercises.${index}.order_index`, index)
      })
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      // First create the template
      const { data: template, error: templateError } = await supabase
        .from('exercise_templates')
        .insert([
          {
            title: values.title,
            notes: values.notes,
            group_id: groupId,
          },
        ])
        .select()
        .single()

      if (templateError) throw templateError

      // Then create the template exercises
      const { error: exercisesError } = await supabase.from('template_exercises').insert(
        values.exercises.map((exercise) => ({
          template_id: template.id,
          ...exercise,
        })),
      )

      if (exercisesError) throw exercisesError

      await queryClient.invalidateQueries({ queryKey: ['exerciseTemplates', groupId] })

      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Error creating template:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Exercise Template</DialogTitle>
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
                {/* <Button type="button" variant="outline" size="sm" onClick={handleAddExercise}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exercise
                </Button> */}
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
                        exercises={[]}
                        remove={remove}
                        form={form}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <DialogFooter className="sm:justify-end">
              <Button type="submit" className="w-full sm:w-auto">
                Create Template
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
