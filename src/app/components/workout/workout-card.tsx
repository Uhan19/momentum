import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutDetails } from './workout-details';
export const WorkoutCard = ({ title }: { title: string }) => {
  return (
    <Card>
      <CardHeader className="flex justify-between flex-row items-center">
        <CardTitle>{title}</CardTitle>
        <WorkoutDetails />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between py-2">
            <span className="font-medium">T1</span>
            <span></span>
          </div>
          <div className="flex justify-between py-2 border-t">
            <span className="font-medium">T2</span>
            <span></span>
          </div>
          <div className="flex justify-between py-2 border-t">
            <span className="font-medium">T3</span>
            <span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
