import React, { useState, useEffect } from 'react';
import { Illustration } from '../../components/Illustration';
import { Home, RefreshCw, X, Delete, Users, User, Link, Info } from 'lucide-react';

import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import { audio } from '../../lib/audio';
import { shuffle } from '../../lib/utils';
import { MultiplayerSetup } from './multiplayer/MultiplayerSetup';
import { MultiplayerGameplay } from './multiplayer/MultiplayerGameplay';
import { MultiplayerCompletion } from './multiplayer/MultiplayerCompletion';
import { HowToPlayModal } from '../../components/HowToPlayModal';

type Phase = 'setup' | 'playing' | 'completed';

const SYMBOLS = [1, 2, 3, 4, 5, 6, 7, 8];

export function CrackTheCode({ onExit }: { onExit: () => void }) {
  useEffect(() => {
    // Start BGM when entering the game
    audio.playBGM();
    return () => {
      // Stop BGM when leaving the game
      audio.stopBGM();
    };
  }, []);

  const [selectMode, setSelectMode] = useState<'SELECT' | 'LOCAL' | 'MULTI'>('SELECT');
  const [phase, setPhase] = useState<any>('setup');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
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

  if (selectMode === 'SELECT') {
    return (
      <div className="game-screen items-center justify-center relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="Crack the Code"
          instructions={[
            "The app hides 4 distinct numbers (1-8) in a secret order.",
            "You have 4 slots to fill with your guesses.",
            "Submit your guess to receive a clue:",
            "'Exact': The number is correct and in the right position.",
            "'Misplaced': The number is in the code but in the wrong position.",
            "Use the clues to deduce the secret code!"
          ]}
        />
        <div className="w-full max-w-md game-panel">
          <div className="flex justify-between items-start mb-6">
            <Illustration emoji="🔐" shape="star" color="#FF5757" className="scale-[0.5] -ml-6 -mt-6" />
            <div className="flex gap-2">
              <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer transition-transform active:scale-95">
                <Info className="w-6 h-6" />
              </button>
              <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer transition-transform active:scale-95">
                <Home className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">Crack the Code</h1>
          <p className="text-slate-500 font-medium mb-8 text-center leading-relaxed">Guess the 4-digit code using logic and clues.</p>

          <div className="space-y-4">
            <button 
              onClick={() => setSelectMode('LOCAL')}
              className="w-full p-4 sm:p-6 game-card bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🎮" shape="square" color="#5CE1E6" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Local Play</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Play solo on this device</div>
              </div>
            </button>
            <button 
              onClick={() => { setSelectMode('MULTI');  }}
              className="w-full p-4 sm:p-6 game-card bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🌍" shape="blob" color="#C1FF72" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Online Multiplayer</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Race to crack the code first</div>
              </div>
            </button>
          </div>
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
      <div className="game-screen items-center justify-center relative">
        <div className="w-full max-w-md game-panel">
          <div className="flex items-center mb-6">
             <button onClick={() => setSelectMode('SELECT')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="game-title-sm ml-2 !text-slate-900 !stroke-none !shadow-none">Local Play</h1>
          </div>
          <p className="mb-4 text-slate-600">The app hides 4 distinct numbers (1-8) in a secret order. No repeats allowed.</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          <ul className="mb-6 space-y-2 text-sm text-slate-500 list-disc pl-5">
            <li>Find the numbers and their exact positions.</li>
            <li>Get counts for "Right place" and "Wrong place".</li>
          </ul>
          <button onClick={startRound} className="w-full py-4 game-button-primary">
            Start Cracking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen relative">
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
                  {[0, 1, 2, 3].map(idx => (
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
