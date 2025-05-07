
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CompletionIndicatorProps {
  completionScore: number;
}

const CompletionIndicator: React.FC<CompletionIndicatorProps> = ({ completionScore }) => {
  let statusColor = 'bg-red-500';
  let statusText = 'Incomplete';
  
  if (completionScore >= 85) {
    statusColor = 'bg-green-500';
    statusText = 'Complete';
  } else if (completionScore >= 60) {
    statusColor = 'bg-amber-500';
    statusText = 'Almost Complete';
  } else if (completionScore >= 30) {
    statusColor = 'bg-orange-500';
    statusText = 'In Progress';
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Listing Completion: {completionScore}%</span>
        <Badge variant={completionScore >= 85 ? "default" : "outline"} className={`${statusColor === 'bg-green-500' ? 'bg-green-500 hover:bg-green-600' : ''}`}>
          {statusText}
        </Badge>
      </div>
      <Progress value={completionScore} className="h-2" />
    </div>
  );
};

export default CompletionIndicator;
