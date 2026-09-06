const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.writeFileSync(path.join(__dirname, 'src/games', file), content.trim() + '\n');
};

write('SecretNumber/index.tsx', `
import React, { useState } from 'react';
import { Home, RefreshCw, User, Cpu, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { audio } from '../../lib/audio';

type Phase = 'setup' | 'friend-entry' | 'playing' | 'completed';

export function SecretNumber({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup');
  
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  
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
`);

write('CrackTheCode/index.tsx', `
import React, { useState } from 'react';
import { Home, RefreshCw, X, Delete } from 'lucide-react';
import { audio } from '../../lib/audio';
import { shuffle } from '../../lib/utils';

type Phase = 'setup' | 'playing' | 'completed';

const SYMBOLS = [1, 2, 3, 4, 5, 6];

export function CrackTheCode({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup');
  
  const [secret, setSecret] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<{ guess: number[]; rightPlace: number; wrongPlace: number }[]>([]);
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);

  const startRound = () => {
    const s = shuffle([...SYMBOLS]).slice(0, 4);
    setSecret(s);
    setGuesses([]);
    setCurrentGuess([]);
    setPhase('playing');
    audio.init();
  };

  const addSymbol = (sym: number) => {
    if (phase !== 'playing') return;
    if (currentGuess.length >= 4) return;
    if (currentGuess.includes(sym)) return;
    setCurrentGuess([...currentGuess, sym]);
    audio.playTap();
  };

  const removeLast = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1));
      audio.playTap();
    }
  };

  const clearGuess = () => {
    if (currentGuess.length > 0) {
      setCurrentGuess([]);
      audio.playTap();
    }
  };

  const submitGuess = () => {
    if (currentGuess.length !== 4) return;
    
    let rightPlace = 0;
    let wrongPlace = 0;
    
    currentGuess.forEach((sym, idx) => {
      if (secret[idx] === sym) {
        rightPlace++;
      } else if (secret.includes(sym)) {
        wrongPlace++;
      }
    });
    
    const newGuesses = [{ guess: [...currentGuess], rightPlace, wrongPlace }, ...guesses];
    setGuesses(newGuesses);
    setCurrentGuess([]);
    
    if (rightPlace === 4) {
      audio.playComplete();
      setPhase('completed');
    } else {
      audio.playWrong();
    }
  };

  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Crack the Code</h1>
          </div>
          <p className="mb-4 text-slate-600">The app hides 4 distinct numbers (1-6) in a secret order. No repeats allowed.</p>
          <ul className="mb-6 space-y-2 text-sm text-slate-500 list-disc pl-5">
            <li>Find the numbers and their exact positions.</li>
            <li>Get counts for "Right place" and "Wrong place".</li>
          </ul>
          <button onClick={startRound} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform">
            Start Cracking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
          <span className="font-bold text-slate-900 ml-2">Crack the Code</span>
        </div>
        <button onClick={startRound} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
      </header>

      <div className="flex-1 flex flex-col max-w-xl mx-auto w-full relative min-h-0">
        {/* History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col-reverse">
          {guesses.map((g, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
              <div className="flex gap-2">
                {g.guess.map((n, j) => (
                  <div key={j} className="w-10 h-10 flex items-center justify-center font-bold text-lg bg-indigo-50 text-indigo-700 rounded-lg">{n}</div>
                ))}
              </div>
              <div className="flex flex-col items-end text-sm">
                <span className="font-bold text-green-600">{g.rightPlace} exact</span>
                <span className="font-bold text-amber-500">{g.wrongPlace} misplaced</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] shrink-0">
          {phase === 'completed' ? (
            <div className="text-center py-4">
              <h2 className="text-2xl font-black text-green-600 mb-2">Code Cracked!</h2>
              <p className="text-slate-600 mb-4">You did it in {guesses.length} guesses.</p>
              <button onClick={startRound} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform">New Code</button>
            </div>
          ) : (
            <>
              {/* Guess Slots */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(idx => (
                    <div key={idx} className={\`w-12 h-12 flex items-center justify-center rounded-xl text-xl font-bold \${currentGuess[idx] ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-300 border-2 border-dashed border-slate-200'}\`}>
                      {currentGuess[idx] || ''}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={clearGuess} disabled={currentGuess.length === 0} className="p-3 text-slate-500 bg-slate-100 rounded-xl disabled:opacity-50"><X className="w-6 h-6" /></button>
                  <button onClick={removeLast} disabled={currentGuess.length === 0} className="p-3 text-amber-600 bg-amber-50 rounded-xl disabled:opacity-50"><Delete className="w-6 h-6" /></button>
                </div>
              </div>

              {/* Symbol Keyboard */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                {SYMBOLS.map(sym => (
                  <button
                    key={sym}
                    onClick={() => addSymbol(sym)}
                    disabled={currentGuess.includes(sym) || currentGuess.length >= 4}
                    className="py-4 text-2xl font-black bg-slate-50 border border-slate-200 text-slate-700 rounded-xl disabled:opacity-30 disabled:bg-slate-100 active:bg-slate-200 transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <button 
                onClick={submitGuess} 
                disabled={currentGuess.length !== 4} 
                className="w-full py-4 bg-indigo-600 text-white font-bold text-lg rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
              >
                Submit Guess
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
`);
