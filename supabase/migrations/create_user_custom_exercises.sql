-- Create user_custom_exercises table
CREATE TABLE IF NOT EXISTS public.user_custom_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Add RLS policies
ALTER TABLE public.user_custom_exercises ENABLE ROW LEVEL SECURITY;

-- Users can only see their own custom exercises
CREATE POLICY "Users can view own custom exercises" ON public.user_custom_exercises
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own custom exercises
CREATE POLICY "Users can create own custom exercises" ON public.user_custom_exercises
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own custom exercises
CREATE POLICY "Users can update own custom exercises" ON public.user_custom_exercises
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own custom exercises
CREATE POLICY "Users can delete own custom exercises" ON public.user_custom_exercises
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_custom_exercises_user_id ON public.user_custom_exercises(user_id);
CREATE INDEX idx_user_custom_exercises_name ON public.user_custom_exercises(name);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_custom_exercises_updated_at 
    BEFORE UPDATE ON public.user_custom_exercises 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();