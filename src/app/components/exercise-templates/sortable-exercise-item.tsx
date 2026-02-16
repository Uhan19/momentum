'use client'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Check, ChevronsUpDown, Plus } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import { useCreateCustomExercise } from '@/hooks/useExercises'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

type FormValues = {
  title: string
  notes?: string
  exercises: Array<{
    exercise_id: string
    sets: number
    reps: number
    weight_type: 'kg' | 'lbs'
    order_index: number
  }>
}

interface SortableExerciseItemProps {
  id: string
  index: number
  exercises: Array<{ id: string; name: string; isCustom?: boolean }>
  remove: (index: number) => void
  form: UseFormReturn<FormValues>
}

export function SortableExerciseItem({
  id,
  index,
  exercises = [],
  remove,
  form,
}: SortableExerciseItemProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const createCustomExercise = useCreateCustomExercise()
  const queryClient = useQueryClient()

  const exerciseValue = form.watch(`exercises.${index}.exercise_id`)
  const selectedExercise = exercises.find((ex) => ex.id === exerciseValue)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleCreateCustom = async () => {
    if (!searchValue.trim()) return

    setIsCreating(true)
    setCreateError(null)
    try {
      const newExercise = await createCustomExercise(searchValue.trim())

      // Update form with new exercise
      form.setValue(`exercises.${index}.exercise_id`, newExercise.id)

      // Invalidate queries to refetch exercises
      await queryClient.invalidateQueries({ queryKey: ['exercises'] })
      await queryClient.invalidateQueries({ queryKey: ['exerciseDefinitions'] })

      setSearchValue('')
      setOpen(false)
    } catch {
      setCreateError('Failed to create exercise. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col gap-3 py-3 ${
        isDragging ? 'bg-muted/50' : ''
      } sm:flex-row sm:items-center sm:gap-4 group`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="cursor-grab hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </Button>

      <FormField
        control={form.control}
        name={`exercises.${index}.exercise_id`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <div
                    role="combobox"
                    aria-label="Select exercise"
                    aria-controls="exercise-select-list"
                    aria-expanded={open}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm bg-muted/50 rounded-md hover:bg-muted transition-colors cursor-pointer"
                  >
                    <span className={selectedExercise ? '' : 'text-muted-foreground'}>
                      {selectedExercise?.name || 'Select exercise'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  </div>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search exercises..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="flex flex-col items-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          No exercise found.
                        </p>
                        {searchValue && (
                          <Button
                            size="sm"
                            onClick={handleCreateCustom}
                            disabled={isCreating}
                            className="gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            {isCreating ? 'Creating...' : `Create "${searchValue}"`}
                          </Button>
                        )}
                        {createError && (
                          <p className="text-sm text-destructive mt-2">{createError}</p>
                        )}
                      </div>
                    </CommandEmpty>
                    {exercises.filter(ex => !ex.isCustom).length > 0 && (
                      <CommandGroup heading="System Exercises">
                        {exercises
                          .filter(ex => !ex.isCustom)
                          .map((exercise) => (
                            <CommandItem
                              key={exercise.id}
                              value={exercise.name}
                              onSelect={() => {
                                field.onChange(exercise.id)
                                setOpen(false)
                                setSearchValue('')
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  exerciseValue === exercise.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {exercise.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}
                    {exercises.filter(ex => ex.isCustom).length > 0 && (
                      <CommandGroup heading="My Custom Exercises">
                        {exercises
                          .filter(ex => ex.isCustom)
                          .map((exercise) => (
                            <CommandItem
                              key={exercise.id}
                              value={exercise.name}
                              onSelect={() => {
                                field.onChange(exercise.id)
                                setOpen(false)
                                setSearchValue('')
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  exerciseValue === exercise.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {exercise.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center gap-2 sm:gap-3">
        <FormField
          control={form.control}
          name={`exercises.${index}.sets`}
          render={({ field }) => (
            <FormItem className="w-16 sm:w-20">
              <FormLabel className="sr-only">Sets</FormLabel>
              <FormControl>
                <input
                  type="number"
                  placeholder="Sets"
                  className="w-full px-2 py-1.5 text-sm text-center bg-muted/50 rounded-md focus:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <span className="text-muted-foreground text-sm">×</span>

        <FormField
          control={form.control}
          name={`exercises.${index}.reps`}
          render={({ field }) => (
            <FormItem className="w-16 sm:w-20">
              <FormLabel className="sr-only">Reps</FormLabel>
              <FormControl>
                <input
                  type="number"
                  placeholder="Reps"
                  className="w-full px-2 py-1.5 text-sm text-center bg-muted/50 rounded-md focus:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`exercises.${index}.weight_type`}
          render={({ field }) => (
            <FormItem className="w-20 sm:w-24">
              <FormLabel className="sr-only">Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-0 bg-muted/50 hover:bg-muted h-8">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove(index)}
        className="self-end sm:self-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}
