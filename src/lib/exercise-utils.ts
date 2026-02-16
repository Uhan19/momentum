// Map exercise names to muscle groups and icons
export const getMuscleGroup = (exerciseName: string): { group: string; icon?: string } => {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('squat') || name.includes('lunge') || name.includes('leg') || name.includes('calf')) {
    return { group: 'Legs' };
  }
  if (name.includes('bench') || name.includes('chest') || name.includes('fly') || name.includes('push')) {
    return { group: 'Chest' };
  }
  if (name.includes('pulldown') || name.includes('row') || name.includes('pull-up') || name.includes('back')) {
    return { group: 'Back' };
  }
  if (name.includes('shoulder') || name.includes('raise') || name.includes('press') && name.includes('overhead')) {
    return { group: 'Shoulders' };
  }
  if (name.includes('curl') || name.includes('bicep')) {
    return { group: 'Arms' };
  }
  if (name.includes('tricep') || name.includes('extension') || name.includes('dip')) {
    return { group: 'Arms' };
  }
  if (name.includes('crunch') || name.includes('plank') || name.includes('abs') || name.includes('core')) {
    return { group: 'Core' };
  }
  if (name.includes('run') || name.includes('cardio') || name.includes('bike') || name.includes('treadmill')) {
    return { group: 'Cardio' };
  }
  
  return { group: 'Full Body' };
};