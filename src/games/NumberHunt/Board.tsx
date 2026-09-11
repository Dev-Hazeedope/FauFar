import React from 'react';
import { PlacedNumber } from './types';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

interface Props {
  layout: PlacedNumber[];
  found: Set<number>;
  currentTarget: number | null;
  onTap: (val: number) => void;
}

export function Board({ layout, found, currentTarget, onTap }: Props) {
  return (
    <div className="relative flex-1 w-full h-full touch-none select-none overflow-hidden bg-white border-4 border-slate-900 rounded-2xl shadow-[inset_4px_4px_0_0_rgba(15,23,42,0.1)] bg-opacity-90 backdrop-blur">
      {layout.map((item) => {
        const isFound = found.has(item.value);
                
        return (
          <button
            key={item.value}
            disabled={isFound}
            onClick={() => onTap(item.value)}
            className={cn(
              "absolute flex items-center justify-center rounded-xl font-black font-outfit touch-manipulation tap-highlight-transparent leading-none drop-shadow-md",
              isFound ? "text-slate-300 pointer-events-none opacity-50" : "active:scale-95 transition-transform",
              
            )}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${item.width}px`,
              height: `${item.height}px`,
              fontSize: `${item.fontSize}px`,
              color: isFound ? undefined : item.colorClass,
            }}
            aria-label={item.value.toString()}
            aria-disabled={isFound}
          >
            <div 
              style={{ transform: `rotate(${item.rotation}deg)` }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {item.value}
              {isFound && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-green-500 opacity-60">
                   <Check strokeWidth={4} className="w-full h-full p-1" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
