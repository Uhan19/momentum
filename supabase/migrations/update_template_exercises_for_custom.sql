-- First, we need to remove the foreign key constraint on exercise_id
ALTER TABLE public.template_exercises 
    DROP CONSTRAINT IF EXISTS template_exercises_exercise_id_fkey;

-- Now template_exercises.exercise_id can reference either exercise_definitions.id 
-- or user_custom_exercises.id without a foreign key constraint

-- We'll add a check to ensure the exercise exists in one of the two tables
CREATE OR REPLACE FUNCTION check_exercise_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if exercise exists in either exercise_definitions or user_custom_exercises
    IF NOT EXISTS (
        SELECT 1 FROM public.exercise_definitions WHERE id = NEW.exercise_id
    ) AND NOT EXISTS (
        SELECT 1 FROM public.user_custom_exercises 
        WHERE id = NEW.exercise_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Exercise does not exist';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to validate exercise exists
CREATE TRIGGER validate_exercise_exists
    BEFORE INSERT OR UPDATE ON public.template_exercises
    FOR EACH ROW
    EXECUTE FUNCTION check_exercise_exists();

-- Do the same for workout_session_exercises
ALTER TABLE public.workout_session_exercises 
    DROP CONSTRAINT IF EXISTS workout_session_exercises_exercise_id_fkey;

-- Add the same trigger for workout_session_exercises
CREATE TRIGGER validate_workout_exercise_exists
    BEFORE INSERT OR UPDATE ON public.workout_session_exercises
    FOR EACH ROW
    EXECUTE FUNCTION check_exercise_exists();

-- Do the same for exercise_sets
ALTER TABLE public.exercise_sets 
    DROP CONSTRAINT IF EXISTS exercise_sets_exercise_id_fkey;

-- Add the same trigger for exercise_sets
CREATE TRIGGER validate_exercise_set_exists
    BEFORE INSERT OR UPDATE ON public.exercise_sets
    FOR EACH ROW
    EXECUTE FUNCTION check_exercise_exists();