'use client';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';

type FormValues = {
  title: string;
  notes?: string;
  exercises: Array<{
    exercise_id: string;
    sets: number;
    reps: number;
    weight_type: 'kg' | 'lbs';
    order_index: number;
  }>;
};

interface SortableExerciseItemProps {
  id: string;
  index: number;
  exercises: Array<{ id: string; name: string }>;
  remove: (index: number) => void;
  form: UseFormReturn<FormValues>;
}

export function SortableExerciseItem({
  id,
  index,
  exercises = [],
  remove,
  form,
}: SortableExerciseItemProps) {
  const [customExercise, setCustomExercise] = useState('');
  const exerciseValue = form.watch(`exercises.${index}.exercise_id`);
  const selectedExercise = exercises.find((ex) => ex.id === exerciseValue)?.name || customExercise;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  console.log('selectedExercise', exerciseValue);
  console.log('exercises', exercises);
  console.log('form', form);
  console.log('index', index);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-4 bg-background p-4 rounded-md border ${
        isDragging ? 'border-primary' : ''
      } sm:flex-row sm:items-center`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="cursor-grab hidden sm:flex"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>

      <FormField
        control={form.control}
        name={`exercises.${index}.exercise_id`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel className="sm:hidden">Exercise</FormLabel>
            <Select
              onValueChange={(value) => {
                if (value === '_custom') {
                  field.onChange(customExercise);
                } else {
                  field.onChange(value);
                  setCustomExercise('');
                }
              }}
              value={field.value}
            >
              <FormControl>
                {/* TODO: change Select to use Command */}
                <SelectTrigger>
                  <SelectValue>{selectedExercise || 'Select exercise'}</SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <div className="p-2">
                  {/* TODO: custom exercise input is not working as expected */}
                  <Input
                    placeholder="Add custom exercise"
                    value={customExercise}
                    onChange={(e) => {
                      e.stopPropagation();
                      setCustomExercise(e.target.value);
                    }}
                    onBlur={(e) => {
                      if (customExercise) {
                        field.onChange(customExercise);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="mb-2"
                  />
                </div>
                <SelectGroup>
                  <SelectLabel>Exercises</SelectLabel>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-3 gap-4 sm:flex sm:gap-4">
        <FormField
          control={form.control}
          name={`exercises.${index}.sets`}
          render={({ field }) => (
            <FormItem className="w-full sm:w-20">
              <FormLabel className="sm:hidden">Sets</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Sets" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`exercises.${index}.reps`}
          render={({ field }) => (
            <FormItem className="w-full sm:w-20">
              <FormLabel className="sm:hidden">Reps</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Reps" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`exercises.${index}.weight_type`}
          render={({ field }) => (
            <FormItem className="w-full sm:w-24">
              <FormLabel className="sm:hidden">Unit</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
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
        className="self-end sm:self-center"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
