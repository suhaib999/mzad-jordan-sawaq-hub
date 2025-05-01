
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { calculateFeedbackStats, fetchFeedbackBySellerId } from '@/services/feedbackService';
import { FeedbackStats } from './FeedbackStats';
import { FeedbackList } from './FeedbackList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThumbsUp, MessageSquare } from 'lucide-react';

interface SellerFeedbackSummaryProps {
  sellerId: string;
}

export const SellerFeedbackSummary = ({ sellerId }: SellerFeedbackSummaryProps) => {
  const { data: feedbackStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['feedback-stats', sellerId],
    queryFn: () => calculateFeedbackStats(sellerId),
    enabled: !!sellerId,
  });

  const { data: feedbackList, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['feedback', sellerId],
    queryFn: () => fetchFeedbackBySellerId(sellerId),
    enabled: !!sellerId,
  });

  const isLoading = isLoadingStats || isLoadingFeedback;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
        <div className="space-y-2">
          <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
          <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
          <div className="h-12 bg-gray-100 animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {feedbackStats && (
        <div className="bg-white p-4 rounded-md border">
          <FeedbackStats stats={feedbackStats} />
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            <MessageSquare className="mr-2 h-4 w-4" />
            All Feedback ({feedbackList?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="positive">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Positive ({feedbackList?.filter(f => f.rating === 'positive').length || 0})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="pt-4">
          {feedbackList && <FeedbackList feedbackList={feedbackList} />}
        </TabsContent>
        <TabsContent value="positive" className="pt-4">
          {feedbackList && <FeedbackList feedbackList={feedbackList.filter(f => f.rating === 'positive')} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
