import React, { useEffect } from 'react';
import { Timer } from 'lucide-react';

export function TimerDisplay({ 
  timedMode, 
  timeLeft, 
  setTimeLeft,
  onTimeUp,
  isActive
}: {
  timedMode: boolean,
  timeLeft: number,
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>,
  onTimeUp: () => void,
  isActive: boolean
}) {
  useEffect(() => {
    if (!timedMode || !isActive) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timedMode, isActive, onTimeUp, setTimeLeft]);

  if (!timedMode) return null;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
  
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg shadow-sm border ${timeLeft <= 10 ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 'bg-white text-slate-700 border-slate-200'}`}>
      <Timer className="w-5 h-5" />
      <span className="tabular-nums w-14 text-center">{timeStr}</span>
    </div>
  );
}
