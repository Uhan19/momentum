import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export const WorkoutDetails = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="hover:bg-accent hover:text-accent-foreground h-8 w-8 rounded-md flex items-center justify-center">
          <MoreHorizontal className="w-4 h-4" />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Workout Details</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
