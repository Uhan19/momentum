import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Play } from 'lucide-react';

interface StartExerciseTemplateDialogProps {
  templateId: string;
}

export const StartExerciseTemplateDialog = ({ templateId }: StartExerciseTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const { data: template } = useQuery({
    queryKey: ['exerciseTemplate', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      return data;
    },
  });

  console.log('template', template);
  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-green-200 hover:bg-green-400 mr-6"
            variant="secondary"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Play className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{template?.title}</DialogTitle>
            <DialogDescription>{template?.description}</DialogDescription>
          </DialogHeader>
          [LIST OF EXERCISES]
        </DialogContent>
      </Dialog>
    </div>
  );
};
