import React from 'react';

export function TimerSetup({ 
  timedMode, setTimedMode, 
  timeLimit, setTimeLimit 
}: { 
  timedMode: boolean, 
  setTimedMode: (v: boolean) => void,
  timeLimit: number,
  setTimeLimit: (v: number) => void
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-4 p-4 bg-white border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0_0_#0f172a]">
        <div>
          <div className="font-semibold text-slate-700">Timed Mode</div>
          <div className="text-sm text-slate-500">Race against the clock</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={timedMode} onChange={(e) => setTimedMode(e.target.checked)} />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5757]"></div>
        </label>
      </div>

      {timedMode && (
        <div className="mt-6 bg-[#C1FF72] p-6 border-4 border-slate-900 rounded-2xl shadow-[4px_4px_0_0_#0f172a] animate-in fade-in slide-in-from-top-2">
          <h2 className="font-bold text-slate-800 mb-4">Time Limit (Minutes)</h2>
          <div>
            <input
              type="number"
              value={Math.max(1, Math.floor(timeLimit / 60))}
              onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1) * 60)}
              className="w-full game-input"
              min="1"
            />
          </div>
        </div>
      )}
    </>
  );
}
