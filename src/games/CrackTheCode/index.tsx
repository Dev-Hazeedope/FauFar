import React, { useState } from 'react';
import { Home, RefreshCw, X, Delete, Users, User, Link } from 'lucide-react';

import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import { audio } from '../../lib/audio';
import { shuffle } from '../../lib/utils';
import { MultiplayerSetup } from './multiplayer/MultiplayerSetup';
import { MultiplayerGameplay } from './multiplayer/MultiplayerGameplay';
import { MultiplayerCompletion } from './multiplayer/MultiplayerCompletion';

type Phase = 'setup' | 'playing' | 'completed';

const SYMBOLS = [1, 2, 3, 4, 5, 6, 7, 8];

export function CrackTheCode({ onExit }: { onExit: () => void }) {
  const [selectMode, setSelectMode] = useState<'SELECT' | 'LOCAL' | 'MULTI'>('SELECT');
  const [phase, setPhase] = useState<any>('setup');
  
  // Multiplayer state
  const [room, setRoom] = useState<any>(null);

  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const [secret, setSecret] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<{ guess: number[]; rightPlace: number; wrongPlace: number }[]>([]);
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);

  const startRound = () => {
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
    const s = shuffle([...SYMBOLS]).slice(0, 5);
    setSecret(s);
    setGuesses([]);
    setCurrentGuess([]);
    setPhase('playing');
    audio.init();
  };

  const addSymbol = (sym: number) => {
    if (phase !== 'playing') return;
    if (currentGuess.length >= 5) return;
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
    if (currentGuess.length !== 5) return;
    
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
    
    if (rightPlace === 5) {
      audio.playComplete();
      setPhase('completed');
    } else {
      audio.playWrong();
    }
  };

  if (selectMode === 'SELECT') {
    return (
      <div className="min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset flex flex-col">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onExit} className="p-3 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
            <Home className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-slate-900">Crack the Code</h1>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-4">
          <button
            onClick={() => setSelectMode('LOCAL')}
            className="w-full p-8 bg-indigo-600 text-white rounded-3xl flex flex-col items-center gap-4 active:scale-95 transition-transform shadow-xl shadow-indigo-600/20"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Local Play</h2>
              <p className="text-indigo-100">Play solo</p>
            </div>
          </button>

          <button
            onClick={() => setSelectMode('MULTI')}
            className="w-full p-8 bg-emerald-500 text-white rounded-3xl flex flex-col items-center gap-4 active:scale-95 transition-transform shadow-xl shadow-emerald-500/20"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Link className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Online Multiplayer</h2>
              <p className="text-emerald-100">Race to crack the code first</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (selectMode === 'MULTI') {
    if (!room) {
      return (
        <MultiplayerSetup 
          onBack={() => setSelectMode('SELECT')} 
          onJoinRoom={setRoom} 
        />
      );
    }
    
    if (room.state === 'completed') {
      return (
        <MultiplayerCompletion
          room={room}
          onLeave={() => { setRoom(null); setSelectMode('SELECT'); }}
          onRoomUpdated={setRoom}
        />
      );
    }
    
    return (
      <MultiplayerGameplay 
        room={room} 
        onLeave={() => { setRoom(null); setSelectMode('SELECT'); }} 
        onGameEnded={setRoom}
      />
    );
  }

  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={() => setSelectMode('SELECT')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Local Play</h1>
          </div>
          <p className="mb-4 text-slate-600">The app hides 5 distinct numbers (1-8) in a secret order. No repeats allowed.</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
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
          <button onClick={() => setSelectMode('SELECT')} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
          <span className="font-bold text-slate-900 ml-2">Local Play</span>
        </div>
        <div className="flex items-center gap-2">
           <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />
           <button onClick={startRound} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
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
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div key={idx} className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl font-bold ${currentGuess[idx] ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-300 border-2 border-dashed border-slate-200'}`}>
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
                    disabled={currentGuess.includes(sym) || currentGuess.length >= 5}
                    className="py-4 text-2xl font-black bg-slate-50 border border-slate-200 text-slate-700 rounded-xl disabled:opacity-30 disabled:bg-slate-100 active:bg-slate-200 transition-colors"
                  >
                    {sym}
                  </button>
                ))}
              </div>

              <button 
                onClick={submitGuess} 
                disabled={currentGuess.length !== 5} 
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
