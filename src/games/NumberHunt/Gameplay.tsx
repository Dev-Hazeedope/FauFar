import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameConfig, PlacedNumber } from './types';
import { generateLayout } from './layout';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';
import { haptics } from '../../lib/haptics';
import { Board } from './Board';
import { Volume2, VolumeX, Lightbulb, RefreshCw, Home, Settings2, Timer as TimerIcon } from 'lucide-react';

interface Props {
  config: GameConfig;
  onComplete: (won: boolean) => void;
  onChangeRange: () => void;
  onHome: () => void;
}

export function Gameplay({ config, onComplete, onChangeRange, onHome }: Props) {
  const [layout, setLayout] = useState<PlacedNumber[] | null>(null);
  const [targets, setTargets] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [isMuted, setIsMuted] = useState(audio.muted);
  const [layoutError, setLayoutError] = useState(false);
  const [resizeError, setResizeError] = useState(false);

  const totalNumbers = config.end - config.start + 1;
  const [timeLeft, setTimeLeft] = useState(config.timeLimit);

  const boardContainerRef = useRef<HTMLDivElement>(null);
  const baseSize = useRef<{ w: number; h: number } | null>(null);

  const initBoard = useCallback((w: number, h: number) => {
    const newLayout = generateLayout(config.start, config.end, w, h);
    if (!newLayout) {
      setLayoutError(true);
      return;
    }
    
    // Generate targets
    const nums = Array.from({ length: totalNumbers }, (_, i) => config.start + i);
    setTargets(shuffle(nums));
    setLayout(newLayout);
    setCurrentIndex(0);
    setFound(new Set());
        setLayoutError(false);
    setResizeError(false);
    setTimeLeft(config.timeLimit);
  }, [config, totalNumbers]);

  useEffect(() => {
    if (!boardContainerRef.current) return;
    
    let initialized = false;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      // Subtract 8px for the border-4 on the Board component
      const innerW = w - 8;
      const innerH = h - 8;
      
      if (innerW > 100 && innerH > 100) {
        if (!initialized) {
          baseSize.current = { w: innerW, h: innerH };
          initBoard(innerW, innerH);
          initialized = true;
        } else if (baseSize.current && (innerW < baseSize.current.w - 20 || innerH < baseSize.current.h - 20)) {
          setResizeError(true);
        }
      }
    });
    
    observer.observe(boardContainerRef.current);
    return () => observer.disconnect();
  }, [initBoard]);

  useEffect(() => {
    if (!config.timedMode || layoutError || resizeError || !layout) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete(false); // Time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [config.timedMode, layoutError, resizeError, layout, onComplete]);

  const handleRestart = () => {
    if (!boardContainerRef.current) return;
    // clientWidth includes padding. We want the content box, so we subtract padding.
    // However, it's safer to just use the baseSize we already stored, or recalculate carefully.
    // Since we know baseSize has the correct content dimensions from ResizeObserver:
    if (baseSize.current) {
      initBoard(baseSize.current.w, baseSize.current.h);
    }
  
  };

  const handleTap = (val: number) => {
    if (layoutError || resizeError) return;
    
    const target = targets[currentIndex];
    
    if (val === target) {
      audio.playCorrect();
      haptics.vibrateSuccess();
            
      const nextFound = new Set(found);
      nextFound.add(val);
      setFound(nextFound);
      
      if (currentIndex + 1 >= targets.length) {
        onComplete(true);
      } else {
        setCurrentIndex(curr => curr + 1);
      }
    } else {
      audio.playWrong();
      haptics.vibrateError();
    }
  };

  const toggleMute = () => {
    audio.toggleMute();
    setIsMuted(audio.muted);
  };

  
  const currentTarget = targets[currentIndex] ?? null;

  return (
    <div className="game-screen relative">
      {/* Header */}
      <header className="flex-none p-4 flex items-center justify-between bg-white border-b-4 border-slate-900 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onHome} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer" aria-label="Home">
            <Home className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Number Hunt</span>
            <span className="text-sm font-medium">{found.size} of {targets.length} found</span>
          </div>
        </div>
        
        {config.timedMode && layout && !layoutError && !resizeError && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xl border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a] ${timeLeft <= 10 ? 'bg-[#FF5757] text-white animate-pulse' : 'bg-white text-slate-900'}`}>
             <TimerIcon className="w-4 h-4" />
             {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        <div 
          className="font-outfit text-3xl font-black text-slate-900 bg-[#5CE1E6] px-6 py-2 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0_0_#0f172a]"
          aria-live="polite"
        >
          {currentTarget !== null ? `Find: ${currentTarget}` : 'Done!'}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggleMute} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer" aria-label="Toggle Sound">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 relative p-2 md:p-4 overflow-hidden flex flex-col" ref={boardContainerRef}>
        {!layout && !layoutError && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            Preparing board...
          </div>
        )}
        
        {layout && (
          <Board 
            layout={layout} 
            found={found} 
            currentTarget={currentTarget} 
            onTap={handleTap} 
          />
        )}

        {/* Error Overlays */}
        {layoutError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6 text-center">
            <div className="game-panel max-w-md"><h2 className="game-title-sm !text-slate-900 !stroke-none !shadow-none mb-2">Too many numbers!</h2>
            <p className="text-slate-600 mb-6 max-w-sm">
              The range {config.start}–{config.end} is too large to fit safely on this screen.
            </p>
            <div className="flex gap-4">
              <button onClick={onChangeRange} className="px-6 py-3 game-button-primary text-xl">
                Change Range
              </button>
            </div>
          </div></div>
        )}

        {resizeError && !layoutError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6 text-center">
            <div className="game-panel max-w-md"><h2 className="game-title-sm !text-slate-900 !stroke-none !shadow-none mb-2">Screen resized</h2>
            <p className="text-slate-600 mb-6 max-w-sm">
              The board no longer fits safely on your screen. You can restart to generate a new board for this size.
            </p>
            <button onClick={handleRestart} className="px-6 py-3 game-button-primary text-xl">
              Restart & Shuffle
            </button>
          </div></div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="flex-none p-4 pb-6 flex items-center justify-center gap-4 bg-white border-t-4 border-slate-900 z-10">
                
        <button 
          onClick={handleRestart}
          className="game-button game-button-secondary px-4 py-2"
        >
          <RefreshCw className="w-5 h-5" /> Restart
        </button>

        <button 
          onClick={onChangeRange}
          className="game-button game-button-secondary px-4 py-2"
        >
          <Settings2 className="w-5 h-5" /> Range
        </button>
      </footer>
    </div>
  );
}
