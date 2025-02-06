import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, Plus, Save } from 'lucide-react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '@/components/ui/command'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { ExerciseDefinition } from '@/types'
import { ExerciseFields } from '@/types'
import { FormValues } from './create-exercise-template-dialog'
import { UseFieldArrayReturn } from 'react-hook-form'

interface AddExerciseDialogProps {
  openAddExerciseDialog: boolean
  setOpenAddExerciseDialog: (open: boolean) => void
  fields: ExerciseFields
  append: UseFieldArrayReturn<FormValues, 'exercises', 'id'>['append']
}

export const AddExerciseDialog = (props: AddExerciseDialogProps) => {
  const { fields, append, openAddExerciseDialog, setOpenAddExerciseDialog } = props
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition[]>([])

  const { data: exercises = [] } = useQuery({
    queryKey: ['exerciseDefinitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_definitions')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Error fetching exercises:', error)
        return []
      }

      return data || []
    },
  })

  const handleExerciseClick = (exercise: ExerciseDefinition) => {
    if (selectedExercise.filter((element) => element.id === exercise.id).length === 0) {
      setSelectedExercise([...selectedExercise, exercise])
    } else {
      setSelectedExercise(selectedExercise.filter((element) => element.id !== exercise.id))
    }
  }

  const handleSaveExercise = () => {
    selectedExercise.forEach((exercise) => {
      append({
        exercise_id: exercise.id,
        sets: 3,
        reps: 10,
        weight_type: 'lbs',
        order_index: fields.length,
      })
    })
    setOpenAddExerciseDialog(false)
  }

  return (
    <div>
      <Dialog open={openAddExerciseDialog} onOpenChange={setOpenAddExerciseDialog}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Add exercise
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Choose your exercise</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleSaveExercise}
                disabled={selectedExercise.length === 0}
                className="disabled:cursor-not-allowed enabled:cursor-pointer enabled:text-green-300 mr-4 enabled:border-green-300"
              >
                <Save className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <Command>
              <CommandInput placeholder="Search exercises" />
              <CommandList>
                <CommandEmpty>[Replace with component that helps add custom exercise]</CommandEmpty>
                {exercises.map((exercise) => (
                  <CommandItem onSelect={() => handleExerciseClick(exercise)} key={exercise.id}>
                    <span>{exercise.name}</span>
                    {selectedExercise.filter((element) => element.id === exercise.id).length >
                      0 && <Check className="h-4 w-4" />}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
