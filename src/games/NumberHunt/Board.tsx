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
    <div className="relative w-full h-full touch-none select-none overflow-hidden rounded-xl bg-[#fffcf7] shadow-inner border border-slate-200">
      {layout.map((item) => {
        const isFound = found.has(item.value);
                
        return (
          <button
            key={item.value}
            disabled={isFound}
            onClick={() => onTap(item.value)}
            className={cn(
              "absolute flex items-center justify-center rounded-xl font-bold touch-manipulation tap-highlight-transparent leading-none",
              isFound ? "text-slate-300 pointer-events-none" : cn(item.colorClass, "active:scale-95 transition-transform"),
              
            )}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              width: `${item.width}px`,
              height: `${item.height}px`,
              fontSize: `${item.fontSize}px`,
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
