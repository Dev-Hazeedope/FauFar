import React, { useState } from 'react';
import { GameConfig } from './types';
import { audio } from '../../lib/audio';
import { ChevronLeft } from 'lucide-react';

interface Props {
  initialConfig: GameConfig;
  onStart: (config: GameConfig) => void;
  onBack: () => void;
}

export function Setup({ initialConfig, onStart, onBack }: Props) {
  const [start, setStart] = useState(initialConfig.start.toString());
  const [end, setEnd] = useState(initialConfig.end.toString());
  const [timedMode, setTimedMode] = useState(initialConfig.timedMode);
  const [timeLimit, setTimeLimit] = useState(initialConfig.timeLimit.toString());
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    const s = parseInt(start, 10);
    const e = parseInt(end, 10);
    const t = parseInt(timeLimit, 10);

    if (isNaN(s) || isNaN(e)) {
      setError('Please enter valid numbers.');
      return;
    }
    if (s < 0 || e > 999) {
      setError('Numbers must be between 0 and 999.');
      return;
    }
    if (s >= e) {
      setError('Start number must be less than end number.');
      return;
    }
    const count = e - s + 1;
    if (count < 2 || count > 200) {
      setError('Total numbers must be between 2 and 200.');
      return;
    }
    if (timedMode && (isNaN(t) || t < 60)) {
      setError('Please enter a valid time limit (minimum 1 minute).');
      return;
    }

    setError(null);
    audio.init();
    onStart({ start: s, end: e, timedMode, timeLimit: t });
  };

  const applyPreset = (s: number, e: number) => {
    setStart(s.toString());
    setEnd(e.toString());
    setError(null);
  };

  return (
    <div className="game-screen items-center justify-center relative">
      <div className="w-full max-w-md game-panel w-full max-w-md">
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack}
            className="game-avatar bg-white hover:bg-slate-200"
            aria-label="Back to collection"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="game-title-sm !text-slate-900 !stroke-none !shadow-none ml-2">Number Hunt</h1>
        </div>

        <p className="text-slate-600 mb-6">
          Find the scattered numbers in order. Choose a range between 0 and 999 (max 200 numbers).
        </p>

        <div className="flex gap-4 mb-6">
          <button onClick={() => applyPreset(1, 40)} className="flex-1 py-3 game-button-secondary text-sm">1–40</button>
          <button onClick={() => applyPreset(1, 100)} className="flex-1 py-3 game-button-secondary text-sm">1–100</button>
          <button onClick={() => applyPreset(1, 200)} className="flex-1 py-3 game-button-secondary text-sm">1–200</button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="startNum" className="block text-sm font-semibold text-slate-700 mb-1">Start number</label>
            <input 
              id="startNum"
              type="number" 
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full game-input"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endNum" className="block text-sm font-semibold text-slate-700 mb-1">End number</label>
            <input 
              id="endNum"
              type="number" 
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full game-input"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-2 p-4 bg-white border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0_0_#0f172a]">
          <div>
            <div className="font-semibold text-slate-700">Timed Mode</div>
            <div className="text-sm text-slate-500">Race against the clock</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={timedMode} 
              onChange={(e) => setTimedMode(e.target.checked)} 
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5757]"></div>
          </label>
        </div>

        {timedMode && (
          <div className="mb-6 bg-[#C1FF72] p-6 border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0_0_#0f172a] animate-in fade-in slide-in-from-top-2">
            <h2 className="font-bold text-slate-800 mb-4">Time Limit (Minutes)</h2>
            <div>
              <input
                id="timeLimit"
                type="number" 
                value={Math.max(1, Math.floor(parseInt(timeLimit) / 60) || 1)}
                onChange={(e) => setTimeLimit((Math.max(1, parseInt(e.target.value) || 1) * 60).toString())}
                className="w-full game-input"
                min="1"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg border border-red-100" role="alert">
            {error}
          </div>
        )}

        <button 
          onClick={handleStart}
          className="w-full py-4 text-xl game-button-primary"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
