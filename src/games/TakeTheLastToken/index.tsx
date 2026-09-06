import React, { useState } from 'react';
import { Home, RefreshCw, Layers } from 'lucide-react';
import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import { audio } from '../../lib/audio';

type Phase = 'setup' | 'playing' | 'completed';
type Rule = 'standard' | 'reverse';

export function TakeTheLastToken({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<any>('setup');
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const [initialCount, setInitialCount] = useState('21');
  const [rule, setRule] = useState<Rule>('standard');
  
  const [tokens, setTokens] = useState(0);
  const [player, setPlayer] = useState<1 | 2>(1);
  const [startingPlayer, setStartingPlayer] = useState<1 | 2>(1);
  const [lastMove, setLastMove] = useState('');

  const startRound = (keepStarter = true) => {
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
    let count = parseInt(initialCount);
    if (isNaN(count) || count < 5 || count > 100) return;
    
    setTokens(count);
    const p = keepStarter ? startingPlayer : (startingPlayer === 1 ? 2 : 1);
    setStartingPlayer(p);
    setPlayer(p);
    setLastMove('Game started.');
    setPhase('playing');
    audio.init();
  };

  const take = (amount: number) => {
    if (phase !== 'playing') return;
    if (amount > tokens || amount < 1 || amount > 3) return;
    
    const remaining = tokens - amount;
    setTokens(remaining);
    
    if (remaining === 0) {
      audio.playComplete();
      setPhase('completed');
      setLastMove(`Player ${player} took ${amount}. Pile is empty.`);
    } else {
      audio.playTap();
      setLastMove(`Player ${player} took ${amount}.`);
      setPlayer(p => p === 1 ? 2 : 1);
    }
  };

  const getWinner = () => {
    if (rule === 'standard') {
      // Last taker wins
      return `Player ${player} Wins!`;
    } else {
      // Last taker loses
      const winner = player === 1 ? 2 : 1;
      return `Player ${winner} Wins!`;
    }
  };

  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Take the Last Token</h1>
          </div>
          <p className="mb-6 text-slate-600">Take 1, 2, or 3 tokens on your turn.</p>
          
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
            <div className="mb-6">
            <label className="block text-sm font-bold text-slate-600 mb-2">Starting Pile (5-60)</label>
            <div className="flex gap-2 mb-2">
               <button onClick={() => setInitialCount('21')} className={`flex-1 py-2 rounded-lg font-bold ${initialCount === '21' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>21</button>
               <button onClick={() => setInitialCount('35')} className={`flex-1 py-2 rounded-lg font-bold ${initialCount === '35' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>35</button>
               <button onClick={() => setInitialCount('50')} className={`flex-1 py-2 rounded-lg font-bold ${initialCount === '50' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>50</button>
            </div>
            <input type="number" min="5" max="100" value={initialCount} onChange={e => setInitialCount(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500" placeholder="Custom..." />
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-600 mb-2">Rule</label>
            <div className="flex gap-2">
               <button onClick={() => setRule('standard')} className={`flex-1 py-3 rounded-xl font-bold flex flex-col items-center gap-1 ${rule === 'standard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                 Standard
                 <span className={`text-xs font-normal ${rule === 'standard' ? 'text-indigo-200' : 'text-slate-500'}`}>Last token wins</span>
               </button>
               <button onClick={() => setRule('reverse')} className={`flex-1 py-3 rounded-xl font-bold flex flex-col items-center gap-1 ${rule === 'reverse' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                 Reverse
                 <span className={`text-xs font-normal ${rule === 'reverse' ? 'text-indigo-200' : 'text-slate-500'}`}>Last token loses</span>
               </button>
            </div>
          </div>
          
          <button onClick={() => startRound(true)} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex flex-col p-4 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 ml-2">Tokens</span>
            <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full uppercase tracking-wider font-bold">
              {rule}
            </span>
          </div>
          <button onClick={() => startRound(true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className={`font-bold px-4 py-1.5 rounded-full ${player === 1 && phase === 'playing' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}`}>P1's Turn</div>
          {phase === 'completed' && <div className="font-black text-slate-900 text-lg animate-in zoom-in">{getWinner()}</div>}
          <div className={`font-bold px-4 py-1.5 rounded-full ${player === 2 && phase === 'playing' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}`}>P2's Turn</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-xl mx-auto">
        <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center mb-8 flex flex-col items-center">
          <h2 className="text-slate-500 font-bold uppercase tracking-wider mb-2">Remaining Tokens</h2>
          <div className="text-8xl font-black text-indigo-600 mb-6">{tokens}</div>
          
          {/* Visual token representation */}
          <div className="flex flex-wrap justify-center gap-2 max-w-sm">
            {Array.from({ length: Math.min(tokens, 60) }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-indigo-200 rounded-full" />
            ))}
          </div>
          <p className="mt-6 text-slate-400 font-medium h-6">{lastMove}</p>
        </div>
        
        {phase === 'playing' ? (
          <div className="w-full space-y-2">
             <h3 className="text-center font-bold text-slate-600 mb-4">Take 1, 2, or 3 tokens:</h3>
             <div className="flex gap-3">
               {[1, 2, 3].map(amt => (
                 <button
                   key={amt}
                   onClick={() => take(amt)}
                   disabled={amt > tokens}
                   className="flex-1 py-6 bg-indigo-600 text-white font-black text-2xl rounded-2xl disabled:opacity-30 disabled:bg-slate-300 active:scale-95 transition-all shadow-md flex flex-col items-center gap-1"
                 >
                   Take {amt}
                 </button>
               ))}
             </div>
          </div>
        ) : (
          <button onClick={() => startRound(false)} className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl active:scale-95 transition-transform shadow-md">
            Play Again
          </button>
        )}
      </main>
    </div>
  );
}
