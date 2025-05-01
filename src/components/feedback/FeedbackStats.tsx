
import React from 'react';
import { FeedbackStats as FeedbackStatsType } from '@/services/feedbackService';
import { Star, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FeedbackStatsProps {
  stats: FeedbackStatsType;
}

export const FeedbackStats = ({ stats }: FeedbackStatsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-green-600">{stats.positivePercentage}%</div>
          <div className="ml-2 text-gray-600">Positive Feedback</div>
        </div>
        <div className="text-gray-600 text-sm mt-1 md:mt-0">
          Based on {stats.total} ratings from the past 12 months
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-24 text-sm flex items-center text-green-600">
            <ThumbsUp className="h-4 w-4 mr-1" />
            Positive:
          </div>
          <Progress 
            className="flex-1 h-2 bg-gray-200" 
            value={stats.total > 0 ? (stats.positive / stats.total * 100) : 0} 
          />
          <div className="w-12 text-right text-sm ml-2">{stats.positive}</div>
        </div>
        
        <div className="flex items-center">
          <div className="w-24 text-sm flex items-center text-gray-500">
            <Minus className="h-4 w-4 mr-1" />
            Neutral:
          </div>
          <Progress 
            className="flex-1 h-2 bg-gray-200" 
            value={stats.total > 0 ? (stats.neutral / stats.total * 100) : 0} 
          />
          <div className="w-12 text-right text-sm ml-2">{stats.neutral}</div>
        </div>
        
        <div className="flex items-center">
          <div className="w-24 text-sm flex items-center text-red-600">
            <ThumbsDown className="h-4 w-4 mr-1" />
            Negative:
          </div>
          <Progress 
            className="flex-1 h-2 bg-gray-200" 
            value={stats.total > 0 ? (stats.negative / stats.total * 100) : 0} 
          />
          <div className="w-12 text-right text-sm ml-2">{stats.negative}</div>
        </div>
      </div>
    </div>
  );
};
