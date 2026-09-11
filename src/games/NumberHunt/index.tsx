import React, { useState } from 'react';
import { GameState, GameConfig } from './types';
import { Setup } from './Setup';
import { Gameplay } from './Gameplay';
import { Completion } from './Completion';
import { MultiplayerSetup } from './multiplayer/MultiplayerSetup';
import { MultiplayerGameplay } from './multiplayer/MultiplayerGameplay';
import { MultiplayerCompletion } from './multiplayer/MultiplayerCompletion';
import { Users, User, Home, Info } from 'lucide-react';
import { HowToPlayModal } from '../../components/HowToPlayModal';
import { Illustration } from '../../components/Illustration';

interface Props {
  onExit: () => void;
}

export function NumberHunt({ onExit }: Props) {
  const [mode, setMode] = useState<'SELECT' | 'SINGLE' | 'MULTI'>('SELECT');
  const [state, setState] = useState<GameState>('SETUP');
  const [config, setConfig] = useState<GameConfig>({ start: 1, end: 40, timedMode: false, timeLimit: 120 });
  const [won, setWon] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  // Multiplayer state
  const [room, setRoom] = useState<any>(null);

  if (mode === 'SELECT') {
    return (
      <div className="game-screen relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="Number Hunt"
          instructions={[
            "Find and tap the numbers in sequential order.",
            "In single-player, race against the clock or play casually.",
            "In multiplayer, race against friends to find the most numbers before the time runs out.",
            "You get points for every correct number you find.",
            "Look carefully, the numbers are scattered all over the board!"
          ]}
        />
        <header className="flex items-center gap-4 mb-8 justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer">
              <Home className="w-6 h-6" />
            </button>
            <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none">Number Hunt</h1>
          </div>
          <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer">
            <Info className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-4">
          <button
            onClick={() => setMode('SINGLE')}
            className="game-card bg-[#5CE1E6] p-8 flex flex-col items-center gap-4 w-full cursor-pointer"
          >
            <Illustration emoji="🎮" shape="square" color="#ffffff" className="scale-75" />
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Single Player</h2>
              <p className="text-slate-800">Find the numbers on your own</p>
            </div>
          </button>

          <button
            onClick={() => setMode('MULTI')}
            className="game-card bg-[#C1FF72] p-8 flex flex-col items-center gap-4 w-full cursor-pointer"
          >
            <Illustration emoji="🌍" shape="blob" color="#ffffff" className="scale-75" />
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Multiplayer</h2>
              <p className="text-slate-800">Race against your friends</p>
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
