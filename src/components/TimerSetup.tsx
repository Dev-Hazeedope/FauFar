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
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg animate-in fade-in slide-in-from-top-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Time Limit (seconds)</label>
          <div className="flex gap-2 mb-3">
            {[30, 60, 120, 300].map(t => (
              <button key={t} type="button" onClick={() => setTimeLimit(t)} className={`flex-1 py-1.5 rounded border text-sm font-medium transition-colors ${timeLimit === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'}`}>
                {t >= 60 ? `${t/60}m` : `${t}s`}
              </button>
            ))}
          </div>
          <input 
            type="number" 
            value={timeLimit}
            onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow text-lg"
          />
        </div>
      )}
    </>
  );
}
