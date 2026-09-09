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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 bg-[#fdfbf7] text-slate-800">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Back to collection"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold ml-2">Number Hunt</h1>
        </div>

        <p className="text-slate-600 mb-6">
          Find the scattered numbers in order. Choose a range between 0 and 999 (max 200 numbers).
        </p>

        <div className="flex gap-4 mb-6">
          <button onClick={() => applyPreset(1, 40)} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium transition-colors">1–40</button>
          <button onClick={() => applyPreset(1, 100)} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium transition-colors">1–100</button>
          <button onClick={() => applyPreset(1, 200)} className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium transition-colors">1–200</button>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="startNum" className="block text-sm font-semibold text-slate-700 mb-1">Start number</label>
            <input 
              id="startNum"
              type="number" 
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow text-lg"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="endNum" className="block text-sm font-semibold text-slate-700 mb-1">End number</label>
            <input 
              id="endNum"
              type="number" 
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow text-lg"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
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
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {timedMode && (
          <div className="mb-6 bg-white p-6 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
            <h2 className="font-bold text-slate-800 mb-4">Time Limit (Minutes)</h2>
            <div>
              <input
                id="timeLimit"
                type="number" 
                value={Math.max(1, Math.floor(parseInt(timeLimit) / 60) || 1)}
                onChange={(e) => setTimeLimit((Math.max(1, parseInt(e.target.value) || 1) * 60).toString())}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-lg transition-colors shadow-sm"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
