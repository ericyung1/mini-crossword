"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface GameTimerProps {
  isActive: boolean;
  onTimeUpdate?: (seconds: number) => void;
}

export function GameTimer({ isActive, onTimeUpdate }: GameTimerProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          onTimeUpdate?.(newSeconds);
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, onTimeUpdate]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setSeconds(0);
  };

  // Reset when isActive becomes true (new puzzle)
  useEffect(() => {
    if (isActive && seconds > 0) {
      reset();
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center gap-2 text-gray-600">
      <Clock className="h-4 w-4" />
      <span className="font-mono text-lg">
        {formatTime(seconds)}
      </span>
    </div>
  );
}
