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
      <div className="flex items-center justify-between mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div>
          <div className="font-semibold text-slate-700">Timed Mode</div>
          <div className="text-sm text-slate-500">Race against the clock</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={timedMode} onChange={(e) => setTimedMode(e.target.checked)} />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {timedMode && (
        <div className="mt-6 bg-white p-6 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <h2 className="font-bold text-slate-800 mb-4">Time Limit (Minutes)</h2>
          <div>
            <input
              type="number"
              value={Math.max(1, Math.floor(timeLimit / 60))}
              onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 1) * 60)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              min="1"
            />
          </div>
        </div>
      )}
    </>
  );
}
