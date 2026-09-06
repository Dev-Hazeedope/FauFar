import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameConfig, PlacedNumber } from './types';
import { generateLayout } from './layout';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';
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
  const [hintActive, setHintActive] = useState(false);
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
    setHintActive(false);
    setLayoutError(false);
    setResizeError(false);
    setTimeLeft(config.timeLimit);
  }, [config, totalNumbers]);

  useEffect(() => {
    if (!boardContainerRef.current) return;
    const w = boardContainerRef.current.clientWidth;
    const h = boardContainerRef.current.clientHeight;
    baseSize.current = { w, h };
    initBoard(w, h);
    
    // Handle resize indicating board doesn't fit anymore
    const handleResize = () => {
      if (!boardContainerRef.current || !baseSize.current) return;
      const currentW = boardContainerRef.current.clientWidth;
      const currentH = boardContainerRef.current.clientHeight;
      
      // If window got significantly smaller, the absolute positioned items might be cut off
      if (currentW < baseSize.current.w - 20 || currentH < baseSize.current.h - 20) {
        setResizeError(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    const w = boardContainerRef.current.clientWidth;
    const h = boardContainerRef.current.clientHeight;
    baseSize.current = { w, h };
    initBoard(w, h);
  };

  const handleTap = (val: number) => {
    if (layoutError || resizeError) return;
    
    const target = targets[currentIndex];
    
    if (val === target) {
      audio.playCorrect();
      setHintActive(false);
      
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
    }
  };

  const toggleMute = () => {
    audio.toggleMute();
    setIsMuted(audio.muted);
  };

  const showHint = () => {
    setHintActive(true);
    setTimeout(() => setHintActive(false), 1500); // Brief outline
  };

  const currentTarget = targets[currentIndex] ?? null;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      {/* Header */}
      <header className="flex-none p-4 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10">
        <div className="flex items-center gap-2">
          <button onClick={onHome} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100" aria-label="Home">
            <Home className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Number Hunt</span>
            <span className="text-sm font-medium">{found.size} of {targets.length} found</span>
          </div>
        </div>
        
        {config.timedMode && layout && !layoutError && !resizeError && (
          <div className={`flex items-center gap-1 font-mono font-bold px-3 py-1.5 rounded-lg shadow-sm ${timeLeft <= 10 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
             <TimerIcon className="w-4 h-4" />
             {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        <div 
          className="text-2xl font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full shadow-sm"
          aria-live="polite"
        >
          {currentTarget !== null ? `Find: ${currentTarget}` : 'Done!'}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggleMute} className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-slate-100" aria-label="Toggle Sound">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Board Area */}
      <main className="flex-1 relative p-2 md:p-4 overflow-hidden" ref={boardContainerRef}>
        {!layout && !layoutError && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            Preparing board...
          </div>
        )}
        
        {layout && (
          <Board 
            layout={layout} 
            found={found} 
            hintActive={hintActive} 
            currentTarget={currentTarget} 
            onTap={handleTap} 
          />
        )}

        {/* Error Overlays */}
        {layoutError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Too many numbers!</h2>
            <p className="text-slate-600 mb-6 max-w-sm">
              The range {config.start}–{config.end} is too large to fit safely on this screen.
            </p>
            <div className="flex gap-4">
              <button onClick={onChangeRange} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
                Change Range
              </button>
            </div>
          </div>
        )}

        {resizeError && !layoutError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm p-6 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Screen resized</h2>
            <p className="text-slate-600 mb-6 max-w-sm">
              The board no longer fits safely on your screen. You can restart to generate a new board for this size.
            </p>
            <button onClick={handleRestart} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm">
              Restart & Shuffle
            </button>
          </div>
        )}
      </main>

      {/* Footer Controls */}
      <footer className="flex-none p-4 pb-6 flex items-center justify-center gap-4 border-t border-slate-200 bg-white z-10">
        <button 
          onClick={showHint}
          disabled={hintActive || layoutError || resizeError}
          className="flex flex-col items-center gap-1 p-2 min-w-[80px] text-slate-600 hover:text-indigo-600 active:scale-95 disabled:opacity-50 transition-all"
        >
          <Lightbulb className="w-6 h-6" />
          <span className="text-xs font-semibold">Hint</span>
        </button>
        
        <button 
          onClick={handleRestart}
          className="flex flex-col items-center gap-1 p-2 min-w-[80px] text-slate-600 hover:text-indigo-600 active:scale-95 transition-all"
        >
          <RefreshCw className="w-6 h-6" />
          <span className="text-xs font-semibold">Restart</span>
        </button>

        <button 
          onClick={onChangeRange}
          className="flex flex-col items-center gap-1 p-2 min-w-[80px] text-slate-600 hover:text-indigo-600 active:scale-95 transition-all"
        >
          <Settings2 className="w-6 h-6" />
          <span className="text-xs font-semibold">Range</span>
        </button>
      </footer>
    </div>
  );
}
