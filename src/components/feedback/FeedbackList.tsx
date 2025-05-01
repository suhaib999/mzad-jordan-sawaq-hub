
import React from 'react';
import { Feedback, FeedbackType } from '@/services/feedbackService';
import { ThumbsUp, ThumbsDown, Minus, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '@/services/profileService';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface FeedbackListProps {
  feedbackList: Feedback[];
}

const FeedbackIcon = ({ type }: { type: FeedbackType }) => {
  switch (type) {
    case 'positive':
      return <ThumbsUp className="h-4 w-4 text-green-600" />;
    case 'neutral':
      return <Minus className="h-4 w-4 text-gray-500" />;
    case 'negative':
      return <ThumbsDown className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const FeedbackItemCard = ({ feedback }: { feedback: Feedback }) => {
  const { data: buyer } = useQuery({
    queryKey: ['profile', feedback.buyer_id],
    queryFn: () => fetchProfile(feedback.buyer_id),
    enabled: !!feedback.buyer_id,
  });

  const buyerName = buyer?.username || buyer?.full_name || `User ${feedback.buyer_id.substring(0, 5)}`;
  
  return (
    <Card className="p-4 border-t border-gray-200">
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={buyer?.avatar_url || undefined} alt={buyerName} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-sm">{buyerName}</span>
            <span className="mx-2 text-gray-400">•</span>
            <div className="flex items-center">
              <FeedbackIcon type={feedback.rating} />
              <span className="ml-1 text-xs capitalize">
                {feedback.rating} feedback
              </span>
            </div>
          </div>
          
          <div className="mt-1 text-sm">{feedback.comment}</div>
          
          <div className="mt-2 text-xs text-gray-500">
            {feedback.created_at && format(new Date(feedback.created_at), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const FeedbackList = ({ feedbackList }: FeedbackListProps) => {
  if (feedbackList.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <ThumbsUp className="h-8 w-8 mx-auto text-gray-400" />
        <h3 className="mt-2 font-medium">No feedback yet</h3>
        <p className="text-sm text-gray-500 mt-1">This seller hasn't received any feedback yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackList.map((feedback) => (
        <FeedbackItemCard key={feedback.id} feedback={feedback} />
      ))}
    </div>
  );
};
