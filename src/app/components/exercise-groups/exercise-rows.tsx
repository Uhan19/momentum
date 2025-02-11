import { useState } from 'react';
import { TemplateExerciseWithDefinition } from '@/types';
import { Check, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ExerciseRowsProps {
  exercises: TemplateExerciseWithDefinition;
}

export const ExerciseRows = ({ exercises }: ExerciseRowsProps) => {
  const [checkedSets, setCheckedSets] = useState<number[]>([]);
  const { sets, reps, weight_type, exercise_definitions } = exercises;
  const { name } = exercise_definitions;

  const setsArray = Array.from({ length: sets }, (set, i) => i + 1);

  const handleCheckClick = (set: number) => {
    if (checkedSets.includes(set)) {
      setCheckedSets((prev) => prev.filter((s) => s !== set));
    } else {
      setCheckedSets((prev) => [...prev, set]);
    }
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
      <h3 className="text-md font-bold exercise-name">{name}</h3>
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
            <Minus className={`row-span-2 ${getTextColor(set)}`} />
          </div>
          <div className="flex items-center justify-center">
            <Input
              className={`mx-1 h-6 border-none shadow-none ${getInputColor(set)}`}
              type="number"
            />
          </div>
          <div className="flex items-center justify-center">
            <Input
              className={`mx-1 h-6 border-none shadow-none ${getInputColor(set)}`}
              type="number"
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
    </div>
  );
};
