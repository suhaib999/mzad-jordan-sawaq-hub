
import React, { useState, useEffect } from 'react';
import { Clock, Timer } from 'lucide-react';

interface AuctionCountdownProps {
  endTime: string;
  onEnd?: () => void;
}

export const AuctionCountdown: React.FC<AuctionCountdownProps> = ({ 
  endTime, 
  onEnd 
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const end = new Date(endTime);
      const now = new Date();
      
      if (end <= now) {
        setTimeRemaining('Auction ended');
        setIsEnding(false);
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
      
      // Set urgent flag if less than 1 hour remaining
      setIsEnding(diffHours < 1);
      
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
  
  const isEnded = timeRemaining === 'Auction ended';
  
  return (
    <div className={`flex items-center p-2 rounded-md ${isEnded ? 'bg-red-50' : isEnding ? 'bg-red-50' : 'bg-amber-50'}`}>
      {isEnding ? 
        <Timer className="h-5 w-5 mr-2 animate-pulse text-red-600" /> : 
        <Clock className="h-5 w-5 mr-2 text-amber-600" />
      }
      <span className={`font-medium ${isEnding && !isEnded ? 'text-red-600 animate-pulse' : isEnded ? 'text-red-600' : 'text-amber-700'}`}>
        {isEnded ? 'Auction ended' : `Time left: ${timeRemaining}`}
      </span>
    </div>
  );
};

