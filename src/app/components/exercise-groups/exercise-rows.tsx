import { useState, useEffect } from 'react';
import { TemplateExerciseWithDefinition } from '@/types';
import { SetData } from '@/types/exercise.types';
import { Check, Minus, Plus, Trash2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useSupabase } from '@/providers/supabase-provider';
import { useExerciseTemplateStore } from '@/store/use-exercise-template-store';

interface ExerciseRowsProps {
  exercises: TemplateExerciseWithDefinition;
  templateId: string;
  onRemoveExercise?: (exerciseDefId: string) => void;
}

interface PreviousSetData {
  weight: number;
  reps: number;
}

export const ExerciseRows = ({ exercises, templateId, onRemoveExercise }: ExerciseRowsProps) => {
  const searchParams = useSearchParams();
  const workoutSessionId = searchParams.get('session');
  const { supabase } = useSupabase();

  const addSetToExercise = useExerciseTemplateStore((state) => state.addSetToExercise);
  const removeSetFromExercise = useExerciseTemplateStore((state) => state.removeSetFromExercise);

  const [checkedSets, setCheckedSets] = useState<number[]>([]);
  const [setData, setSetData] = useState<Record<number, SetData>>({});
  const [previousData, setPreviousData] = useState<Record<number, PreviousSetData>>({});
  const { sets, weight_type, exercise_definitions } = exercises;

  const setsArray = Array.from({ length: sets }, (_, i) => i + 1);

  // Initialize set data — additive: only create new entries, remove entries above count
  useEffect(() => {
    setSetData((prev) => {
      const updated: Record<number, SetData> = {};
      for (let i = 1; i <= sets; i++) {
        updated[i] = prev[i] || { weight: 0, reps: 0, completed: false };
      }
      return updated;
    });
    // Clean checked sets that are above the current count
    setCheckedSets((prev) => prev.filter((s) => s <= sets));
  }, [sets]);

  // Fetch previous workout data for this exercise
  useEffect(() => {
    const fetchPreviousData = async () => {
      if (!exercise_definitions?.id || !workoutSessionId) return;

      const { data } = await supabase
        .from('exercise_sets')
        .select('set_number, weight, reps, workout_session_id, workout_sessions!inner(status)')
        .eq('exercise_id', exercise_definitions.id)
        .eq('completed', true)
        .neq('workout_session_id', workoutSessionId)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mostRecentSessionId = data[0].workout_session_id;
        const previousSets: Record<number, PreviousSetData> = {};
        data
          .filter((s) => s.workout_session_id === mostRecentSessionId)
          .forEach((s) => {
            previousSets[s.set_number] = {
              weight: s.weight || 0,
              reps: s.reps || 0,
            };
          });
        setPreviousData(previousSets);
      }
    };

    fetchPreviousData();
  }, [exercise_definitions?.id, workoutSessionId, supabase]);

  // Store exercise data in localStorage for retrieval when finishing workout
  useEffect(() => {
    if (workoutSessionId && exercise_definitions?.id) {
      const exerciseKey = `workout_${workoutSessionId}_exercise_${exercise_definitions.id}`;
      localStorage.setItem(exerciseKey, JSON.stringify(setData));
    }
  }, [setData, workoutSessionId, exercise_definitions?.id]);

  if (!exercise_definitions) {
    return null;
  }

  const { name } = exercise_definitions;

  const handleCheckClick = (setNumber: number) => {
    const isChecked = !checkedSets.includes(setNumber);
    if (isChecked) {
      setCheckedSets((prev) => [...prev, setNumber]);
    } else {
      setCheckedSets((prev) => prev.filter((s) => s !== setNumber));
    }

    setSetData((prev) => ({
      ...prev,
      [setNumber]: { ...prev[setNumber], completed: isChecked },
    }));
  };

  const handleWeightChange = (setNumber: number, weight: string) => {
    const weightValue = parseFloat(weight) || 0;
    setSetData((prev) => ({
      ...prev,
      [setNumber]: { ...prev[setNumber], weight: weightValue },
    }));
  };

  const handleRepsChange = (setNumber: number, reps: string) => {
    const repsValue = parseInt(reps) || 0;
    setSetData((prev) => ({
      ...prev,
      [setNumber]: { ...prev[setNumber], reps: repsValue },
    }));
  };

  const getInputColor = (set: number) => {
    if (checkedSets.includes(set)) {
      return 'bg-transparent';
    }
    return 'bg-zinc-200/70 dark:bg-zinc-600';
  };

  const getTextColor = (set: number) => {
    if (checkedSets.includes(set)) {
      return 'text-slate-100 dark:text-zinc-600';
    }
    return 'text-zinc-600 dark:text-zinc-200';
  };

  const getCheckColor = (set: number) => {
    if (checkedSets.includes(set)) {
      return 'bg-green-500 text-black dark:text-zinc-600';
    }
    return 'bg-zinc-200/70 text-zinc-600 dark:text-zinc-200 dark:bg-zinc-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold exercise-name">{name}</h3>
        {onRemoveExercise && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => onRemoveExercise(exercise_definitions.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-[40px_1fr_1fr_1fr_35px] gap-2 mb-1">
        <div>Set</div>
        <div className="text-center">Previous</div>
        <div className="text-center">{weight_type}</div>
        <div className="text-center">Reps</div>
        <div className="flex items-center justify-center">
          <Check />
        </div>
      </div>
      {setsArray.map((set) => (
        <div
          key={set}
          className={`grid grid-cols-[40px_1fr_1fr_1fr_35px] ${checkedSets.includes(set) ? 'bg-green-500/30' : ''} py-2`}
        >
          <span className="row-span-2">{set}</span>
          <div className="flex items-center justify-center">
            {previousData[set] ? (
              <span className={`text-xs ${getTextColor(set)}`}>
                {previousData[set].weight}×{previousData[set].reps}
              </span>
            ) : (
              <Minus className={`row-span-2 ${getTextColor(set)}`} />
            )}
          </div>
          <div className="flex items-center justify-center">
            <Input
              className={`mx-1 h-6 border-none shadow-none ${getInputColor(set)}`}
              type="number"
              value={setData[set]?.weight || ''}
              onChange={(e) => handleWeightChange(set, e.target.value)}
            />
          </div>
          <div className="flex items-center justify-center">
            <Input
              className={`mx-1 h-6 border-none shadow-none ${getInputColor(set)}`}
              type="number"
              value={setData[set]?.reps || ''}
              onChange={(e) => handleRepsChange(set, e.target.value)}
            />
          </div>
          <div className="flex items-center justify-center">
            <Check
              onClick={() => handleCheckClick(set)}
              className={`w-7 h-6 rounded-md ${getCheckColor(set)}`}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => addSetToExercise(templateId, exercise_definitions.id)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Set
        </Button>
        {sets > 1 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
            onClick={() => removeSetFromExercise(templateId, exercise_definitions.id)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove Set
          </Button>
        )}
      </div>
    </div>
  );
};
