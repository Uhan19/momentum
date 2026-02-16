-- Add a column to exercise_definitions to track if it's a system or custom exercise
ALTER TABLE public.exercise_definitions 
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_exercise_definitions_user_id ON public.exercise_definitions(user_id);

-- Update RLS policies for exercise_definitions to allow users to see system exercises and their own custom exercises
ALTER TABLE public.exercise_definitions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view system exercises" ON public.exercise_definitions;
DROP POLICY IF EXISTS "Users can view own custom exercises" ON public.exercise_definitions;
DROP POLICY IF EXISTS "Users can create own custom exercises" ON public.exercise_definitions;
DROP POLICY IF EXISTS "Users can update own custom exercises" ON public.exercise_definitions;
DROP POLICY IF EXISTS "Users can delete own custom exercises" ON public.exercise_definitions;

-- Everyone can view system exercises (where is_custom = false)
CREATE POLICY "Everyone can view system exercises" ON public.exercise_definitions
    FOR SELECT USING (is_custom = false OR user_id = auth.uid());

-- Users can create their own custom exercises
CREATE POLICY "Users can create own custom exercises" ON public.exercise_definitions
    FOR INSERT WITH CHECK (is_custom = true AND user_id = auth.uid());

-- Users can update their own custom exercises
CREATE POLICY "Users can update own custom exercises" ON public.exercise_definitions
    FOR UPDATE USING (is_custom = true AND user_id = auth.uid());

-- Users can delete their own custom exercises
CREATE POLICY "Users can delete own custom exercises" ON public.exercise_definitions
    FOR DELETE USING (is_custom = true AND user_id = auth.uid());

-- Migrate any existing data from user_custom_exercises to exercise_definitions
INSERT INTO public.exercise_definitions (id, name, description, is_custom, user_id, created_at)
SELECT id, name, description, true, user_id, created_at
FROM public.user_custom_exercises
ON CONFLICT (id) DO NOTHING;