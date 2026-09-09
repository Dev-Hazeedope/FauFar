import React, { useState } from 'react';
import { Home, RefreshCw, Users, User } from 'lucide-react';
import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import { audio } from '../../lib/audio';
import { MultiplayerSetup } from './multiplayer/MultiplayerSetup';
import { MultiplayerGameplay } from './multiplayer/MultiplayerGameplay';
import { MultiplayerCompletion } from './multiplayer/MultiplayerCompletion';

type Phase = 'setup' | 'playing' | 'completed';

const COLS = 9;
const ROWS = 7;

export function FourInARow({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<'SELECT' | 'SINGLE' | 'MULTI'>('SELECT');
  const [phase, setPhase] = useState<Phase>('setup');
  
  // Multiplayer state
  const [room, setRoom] = useState<any>(null);
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // board[c][r] - bottom is r=0
  const [board, setBoard] = useState<(1 | 2 | null)[][]>(
    Array.from({ length: COLS }, () => Array(ROWS).fill(null))
  );
  
  const [player, setPlayer] = useState<1 | 2>(1);
  const [startingPlayer, setStartingPlayer] = useState<1 | 2>(1);
  const [winLine, setWinLine] = useState<{c:number, r:number}[]>([]);
  const [isDraw, setIsDraw] = useState(false);

  const startRound = (keepStarter = true) => {
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
    setBoard(Array.from({ length: COLS }, () => Array(ROWS).fill(null)));
    const p = keepStarter ? startingPlayer : (startingPlayer === 1 ? 2 : 1);
    setStartingPlayer(p);
    setPlayer(p);
    setWinLine([]);
    setIsDraw(false);
    setPhase('playing');
    audio.init();
  };

  if (mode === 'SELECT') {
    return (
      <div className="min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset flex flex-col">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onExit} className="p-3 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
            <Home className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-slate-900">Four in a Row</h1>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-4">
          <button
            onClick={() => setMode('SINGLE')}
            className="w-full p-8 bg-indigo-600 text-white rounded-3xl flex flex-col items-center gap-4 active:scale-95 transition-transform shadow-xl shadow-indigo-600/20"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Local Play</h2>
              <p className="text-indigo-100">Pass and play on this device</p>
            </div>
          </button>

          <button
            onClick={() => setMode('MULTI')}
            className="w-full p-8 bg-emerald-500 text-white rounded-3xl flex flex-col items-center gap-4 active:scale-95 transition-transform shadow-xl shadow-emerald-500/20"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Multiplayer</h2>
              <p className="text-emerald-100">Play against a friend online</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'MULTI') {
    if (!room) {
      return (
        <MultiplayerSetup 
          onBack={() => setMode('SELECT')} 
          onJoinRoom={setRoom} 
        />
      );
    }
    
    if (room.state === 'completed') {
      return (
        <MultiplayerCompletion
          room={room}
          onLeave={() => { setRoom(null); setMode('SELECT'); }}
          onRoomUpdated={setRoom}
        />
      );
    }
    
    return (
      <MultiplayerGameplay 
        room={room} 
        onLeave={() => { setRoom(null); setMode('SELECT'); }} 
        onGameEnded={setRoom}
      />
    );
  }

  const checkWin = (b: (1|2|null)[][], c: number, r: number, p: 1|2) => {
    const dirs = [[1,0], [0,1], [1,1], [1,-1]];
    for (const [dc, dr] of dirs) {
      let count = 1;
      const line = [{c, r}];
      
      // forward
      let nc = c + dc; let nr = r + dr;
      while (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && b[nc][nr] === p) {
        count++;
        line.push({c:nc, r:nr});
        nc += dc; nr += dr;
      }
      
      // backward
      nc = c - dc; nr = r - dr;
      while (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && b[nc][nr] === p) {
        count++;
        line.push({c:nc, r:nr});
        nc -= dc; nr -= dr;
      }
      
      if (count >= 4) return line;
    }
    return null;
  };

  const dropPiece = (col: number) => {
    if (phase !== 'playing') return;
    
    const column = board[col];
    const r = column.findIndex(cell => cell === null);
    if (r === -1) return; // Full
    
    const newBoard = [...board];
    newBoard[col] = [...column];
    newBoard[col][r] = player;
    setBoard(newBoard);
    
    const win = checkWin(newBoard, col, r, player);
    if (win) {
      audio.playComplete();
      setWinLine(win);
      setPhase('completed');
    } else {
      // Check draw
      const isFull = newBoard.every(c => c[ROWS - 1] !== null);
      if (isFull) {
        audio.playWrong();
        setIsDraw(true);
        setPhase('completed');
      } else {
        audio.playTap();
        setPlayer(p => p === 1 ? 2 : 1);
      }
    }
  };

  const getWinner = () => {
    if (isTimeUp) return "Time's Up!";
    if (isDraw) return 'Draw!';
    return `Player ${player} Wins!`;
  };

  if (phase === 'setup') {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
            <button onClick={() => setMode('SELECT')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
              <Home className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-black ml-2 text-slate-900">Local Play</h1>
          </div>
          <p className="mb-6 text-slate-600">Connect 4 pieces horizontally, vertically, or diagonally.</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          <button onClick={() => startRound(true)} className="w-full mt-6 py-4 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform">
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
            <button onClick={() => setMode('SELECT')} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 ml-2">Local Play</span>
          </div>
          <button onClick={() => startRound(true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
        
        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />

        <div className="flex items-center justify-between px-2">
          <div className={`font-bold px-4 py-1.5 rounded-full ${player === 1 && phase === 'playing' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}`}>P1 (Blue)</div>
          {phase === 'completed' && <div className="font-black text-slate-900 text-lg animate-in zoom-in">{getWinner()}</div>}
          <div className={`font-bold px-4 py-1.5 rounded-full ${player === 2 && phase === 'playing' ? 'bg-rose-500 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}`}>P2 (Red)</div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="flex bg-blue-100 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-inner gap-1 sm:gap-2">
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={c}
              onClick={() => dropPiece(c)}
              disabled={phase !== 'playing' || board[c][ROWS - 1] !== null}
              aria-label={`Drop in column ${c + 1}`}
              className="flex flex-col-reverse gap-1 sm:gap-2 outline-none group"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-50 transition-opacity bg-indigo-600 pointer-events-none" style={{ backgroundColor: player === 1 ? '#4f46e5' : '#f43f5e' }} />
              
              {Array.from({ length: ROWS }).map((_, r) => {
                const cell = board[c][r];
                const isWin = winLine.some(loc => loc.c === c && loc.r === r);
                return (
                  <div 
                    key={r}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shadow-inner transition-all duration-300 ${
                      cell === 1 ? 'bg-indigo-600' :
                      cell === 2 ? 'bg-rose-500' :
                      'bg-[#fdfbf7]'
                    } ${isWin ? 'ring-4 ring-white scale-110 z-10 shadow-lg' : ''}`}
                  />
                );
              })}
            </button>
          ))}
        </div>
        
        {phase === 'completed' && (
          <div className="mt-8">
            <button onClick={() => startRound(false)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-md">
              Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
