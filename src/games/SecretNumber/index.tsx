import React, { useState } from 'react';
import { Home, RefreshCw, User, Cpu, ArrowUp, ArrowDown, Check } from 'lucide-react';

import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import { audio } from '../../lib/audio';

type Phase = 'setup' | 'friend-entry' | 'playing' | 'completed';

export function SecretNumber({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<any>('setup');
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('1000');
  
  const [secret, setSecret] = useState<number>(0);
  const [source, setSource] = useState<'app' | 'friend'>('app');
  const [friendSecretInput, setFriendSecretInput] = useState('');
  
  const [guesses, setGuesses] = useState<{ value: number; result: 'low' | 'high' | 'correct' }[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  
  // Bounds
  const [currentMin, setCurrentMin] = useState(0);
  const [currentMax, setCurrentMax] = useState(100);

  const startAppChooses = () => {
    const mn = parseInt(min);
    const mx = parseInt(max);
    if (isNaN(mn) || isNaN(mx) || mn >= mx || mn < 0 || mx > 999) return;
    
    setSource('app');
    const sec = Math.floor(Math.random() * (mx - mn + 1)) + mn;
    setupGame(sec, mn, mx);
  };

  const startFriendSets = () => {
    const mn = parseInt(min);
    const mx = parseInt(max);
    if (isNaN(mn) || isNaN(mx) || mn >= mx || mn < 0 || mx > 999) return;
    
    setSource('friend');
    setFriendSecretInput('');
    setPhase('friend-entry');
  };

  const confirmFriendSecret = () => {
    const mn = parseInt(min);
    const mx = parseInt(max);
    const sec = parseInt(friendSecretInput);
    if (isNaN(sec) || sec < mn || sec > mx) return;
    setupGame(sec, mn, mx);
  };

  const setupGame = (sec: number, mn: number, mx: number) => {
    setSecret(sec);
    setCurrentMin(mn);
    setCurrentMax(mx);
    setGuesses([]);
    setCurrentGuess('');
    setPhase('playing');
    audio.init();
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'playing') return;
    
    const g = parseInt(currentGuess);
    if (isNaN(g)) return;
    
    if (g < currentMin || g > currentMax) {
      // Invalid out of bounds
      setCurrentGuess('');
      return;
    }
    
    if (guesses.some(x => x.value === g)) {
      setCurrentGuess('');
      return;
    }
    
    let res: 'low' | 'high' | 'correct' = 'correct';
    if (g < secret) {
      res = 'low';
      setCurrentMin(Math.max(currentMin, g + 1));
      audio.playTap();
    } else if (g > secret) {
      res = 'high';
      setCurrentMax(Math.min(currentMax, g - 1));
      audio.playTap();
    } else {
      res = 'correct';
      audio.playComplete();
      setPhase('completed');
    }
    
    setGuesses([{ value: g, result: res }, ...guesses]);
    setCurrentGuess('');
  };

  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Secret Number</h1>
          </div>
          <p className="mb-6 text-slate-600">Guess a hidden number based on higher/lower clues.</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Min (0-998)</label>
              <input type="number" value={min} onChange={e => setMin(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-1">Max (1-999)</label>
              <input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          
          <div className="space-y-3">
            <button onClick={startAppChooses} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
              <Cpu className="w-5 h-5" /> App Chooses
            </button>
            <button onClick={startFriendSets} className="w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
              <User className="w-5 h-5" /> Friend Sets Secret
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'friend-entry') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center animate-in fade-in">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Host Only!</h2>
          <p className="mb-8 text-slate-600">Enter a secret number between {min} and {max}. Do not let the guesser see.</p>
          
          <input 
            type="number" 
            value={friendSecretInput} 
            onChange={e => setFriendSecretInput(e.target.value)} 
            placeholder="Secret number..."
            className="w-full p-4 mb-6 rounded-xl border border-slate-200 bg-slate-50 text-xl font-bold text-center focus:ring-2 focus:ring-indigo-500" 
          />
          <button onClick={confirmFriendSecret} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform">
            Set Secret & Hand Over
          </button>
          <button onClick={() => setPhase('setup')} className="w-full py-4 mt-3 bg-slate-100 text-slate-600 font-bold rounded-xl">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
          <span className="font-bold text-slate-900 ml-2">Guess the Secret</span>
        </div>
        <button onClick={() => {
          if (source === 'app') {
             startAppChooses();
          } else {
             setFriendSecretInput('');
             setPhase('friend-entry');
          }
        }} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center max-w-xl mx-auto w-full">
        {phase === 'playing' ? (
          <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-slate-200 text-center mb-6">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Possible Range</h2>
            <div className="text-4xl font-black text-indigo-600 mb-8">{currentMin} - {currentMax}</div>
            
            <form onSubmit={handleGuess} className="flex gap-2">
              <input
                type="number"
                value={currentGuess}
                onChange={e => setCurrentGuess(e.target.value)}
                placeholder="Enter guess..."
                className="flex-1 p-4 rounded-xl border border-slate-200 bg-slate-50 text-xl font-bold focus:ring-2 focus:ring-indigo-500 text-center"
              />
              <button type="submit" disabled={!currentGuess} className="px-6 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50">Guess</button>
            </form>
          </div>
        ) : (
          <div className="w-full bg-green-50 p-8 rounded-3xl shadow-sm border border-green-200 text-center mb-6 animate-in zoom-in-95">
            <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">You got it!</h2>
            <div className="text-5xl font-black text-green-700 mb-6">{secret}</div>
            <p className="text-green-800 font-medium">Guessed in {guesses.length + 1} attempts.</p>
          </div>
        )}

        <div className="w-full space-y-3 flex-1 overflow-y-auto">
          {guesses.map((g, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xl font-bold text-slate-700 w-16">{g.value}</span>
              <div className="flex-1 text-center">
                {g.result === 'low' && <span className="flex items-center justify-center gap-2 font-bold text-blue-600"><ArrowUp className="w-5 h-5" /> Higher</span>}
                {g.result === 'high' && <span className="flex items-center justify-center gap-2 font-bold text-amber-600"><ArrowDown className="w-5 h-5" /> Lower</span>}
                {g.result === 'correct' && <span className="flex items-center justify-center gap-2 font-bold text-green-600"><Check className="w-5 h-5" /> Correct</span>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
