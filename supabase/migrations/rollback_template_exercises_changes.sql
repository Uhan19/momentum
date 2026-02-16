-- Drop the triggers we created
DROP TRIGGER IF EXISTS validate_exercise_exists ON public.template_exercises;
DROP TRIGGER IF EXISTS validate_workout_exercise_exists ON public.workout_session_exercises;
DROP TRIGGER IF EXISTS validate_exercise_set_exists ON public.exercise_sets;

-- Drop the check function
DROP FUNCTION IF EXISTS check_exercise_exists();

-- Restore the foreign key constraints
ALTER TABLE public.template_exercises 
    ADD CONSTRAINT template_exercises_exercise_id_fkey 
    FOREIGN KEY (exercise_id) REFERENCES public.exercise_definitions(id);

ALTER TABLE public.workout_session_exercises 
    ADD CONSTRAINT workout_session_exercises_exercise_id_fkey 
    FOREIGN KEY (exercise_id) REFERENCES public.exercise_definitions(id);

ALTER TABLE public.exercise_sets 
    ADD CONSTRAINT exercise_sets_exercise_id_fkey 
    FOREIGN KEY (exercise_id) REFERENCES public.exercise_definitions(id);