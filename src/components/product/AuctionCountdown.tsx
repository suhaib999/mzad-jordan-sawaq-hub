
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface AuctionCountdownProps {
  endTime: string;
  onEnd?: () => void;
}

export const AuctionCountdown: React.FC<AuctionCountdownProps> = ({ 
  endTime, 
  onEnd 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endTime);
      const now = new Date();
      
      if (end <= now) {
        setTimeRemaining('Auction ended');
        if (onEnd) onEnd();
        return;
      }
      
      const diffMs = end.getTime() - now.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      const hours = diffHours % 24;
      const mins = diffMins % 60;
      const secs = diffSecs % 60;
      
      if (diffDays > 0) {
        setTimeRemaining(`${diffDays}d ${hours}h ${mins}m ${secs}s`);
      } else if (diffHours > 0) {
        setTimeRemaining(`${hours}h ${mins}m ${secs}s`);
      } else if (diffMins > 0) {
        setTimeRemaining(`${mins}m ${secs}s`);
      } else {
        setTimeRemaining(`${secs}s`);
      }
    };
    
    calculateTimeRemaining();
    const timerId = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(timerId);
  }, [endTime, onEnd]);
  
  return (
    <div className={`flex items-center ${timeRemaining === 'Auction ended' ? 'text-red-500' : 'text-amber-600'}`}>
      <Clock className="h-4 w-4 mr-1.5" />
      <span className="font-medium">{timeRemaining}</span>
    </div>
  );
};
