import React, { useState } from 'react';
import { GameState, GameConfig } from './types';
import { Setup } from './Setup';
import { Gameplay } from './Gameplay';
import { Completion } from './Completion';
import { MultiplayerSetup } from './multiplayer/MultiplayerSetup';
import { MultiplayerGameplay } from './multiplayer/MultiplayerGameplay';
import { MultiplayerCompletion } from './multiplayer/MultiplayerCompletion';
import { Users, User, Home } from 'lucide-react';

interface Props {
  onExit: () => void;
}

export function NumberHunt({ onExit }: Props) {
  const [mode, setMode] = useState<'SELECT' | 'SINGLE' | 'MULTI'>('SELECT');
  const [state, setState] = useState<GameState>('SETUP');
  const [config, setConfig] = useState<GameConfig>({ start: 1, end: 40, timedMode: false, timeLimit: 120 });
  const [won, setWon] = useState(true);
  
  // Multiplayer state
  const [room, setRoom] = useState<any>(null);

  if (mode === 'SELECT') {
    return (
      <div className="min-h-[100dvh] bg-[#fdfbf7] p-6 safe-area-inset flex flex-col">
        <header className="flex items-center gap-4 mb-8">
          <button onClick={onExit} className="p-3 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full">
            <Home className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-slate-900">Number Hunt</h1>
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
              <h2 className="text-2xl font-bold mb-1">Single Player</h2>
              <p className="text-indigo-100">Find the numbers on your own</p>
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
              <p className="text-emerald-100">Race against your friends</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'MULTI') {
    switch (state) {
      case 'SETUP':
        return (
          <MultiplayerSetup 
            onBack={() => setMode('SELECT')} 
            onJoinRoom={(r) => {
              setRoom(r);
              setState('PREPARING'); // Actually we wait for host to start
            }} 
          />
        );
      case 'PREPARING':
      case 'PLAYING':
        return (
          <MultiplayerGameplay 
            room={room} 
            onLeave={() => {
              setRoom(null);
              setState('SETUP');
              setMode('SELECT');
            }}
            onGameEnded={(r) => {
              setRoom(r);
              setState('COMPLETED');
            }}
            onRoomUpdated={setRoom}
          />
        );
      case 'COMPLETED':
        return (
          <MultiplayerCompletion 
            room={room} 
            onLeave={() => {
              setRoom(null);
              setState('SETUP');
              setMode('SELECT');
            }}
            onRoomUpdated={(r) => {
              setRoom(r);
              if (r.state === 'waiting') setState('PREPARING');
            }}
          />
        );
    }
  }

  // Single player mode
  switch (state) {
    case 'SETUP':
      return (
        <Setup
          initialConfig={config}
          onStart={(c) => {
            setConfig(c);
            setState('PLAYING');
          }}
          onBack={() => setMode('SELECT')}
        />
      );
    case 'PLAYING':
      return (
        <Gameplay
          config={config}
          onChangeRange={() => setState('SETUP')}
          onHome={onExit}
          onComplete={(didWin) => {
            setWon(didWin);
            setState('COMPLETED');
          }}
        />
      );
    case 'COMPLETED':
      return (
        <Completion
          won={won}
          onPlayAgain={() => setState('PLAYING')}
          onChangeRange={() => setState('SETUP')}
        />
      );
    default:
      return null;
  }
}
