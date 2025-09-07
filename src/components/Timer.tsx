'use client';

import { useState, useEffect, useRef } from 'react';

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
  resetTrigger?: number; // Change this value to reset the timer
  className?: string;
}

export default function Timer({ 
  isRunning, 
  onTimeUpdate, 
  resetTrigger = 0,
  className = '' 
}: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset timer when resetTrigger changes
  useEffect(() => {
    setSeconds(0);
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  }, [resetTrigger, onTimeUpdate]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          const newTime = prev + 1;
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (seconds < 60) return 'text-green-600'; // Under 1 minute - excellent
    if (seconds < 180) return 'text-blue-600'; // Under 3 minutes - good
    if (seconds < 300) return 'text-yellow-600'; // Under 5 minutes - okay
    return 'text-red-600'; // Over 5 minutes - challenging
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <svg 
          className="w-5 h-5 text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12,6 12,12 16,14"></polyline>
        </svg>
        <span className={`font-mono text-lg font-bold ${getTimerColor()}`}>
          {formatTime(seconds)}
        </span>
      </div>
      
      {/* Status indicator */}
      <div className={`w-2 h-2 rounded-full ${
        isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
      }`}></div>
    </div>
  );
}
