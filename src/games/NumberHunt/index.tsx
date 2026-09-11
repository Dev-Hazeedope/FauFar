import React, { useState, useEffect } from 'react';
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
import { audio } from '../../lib/audio';

interface Props {
  onExit: () => void;
}

export function NumberHunt({ onExit }: Props) {
  useEffect(() => {
    // Start BGM when entering the game
    audio.playBGM();
    return () => {
      // Stop BGM when leaving the game
      audio.stopBGM();
    };
  }, []);

  const [mode, setMode] = useState<'SELECT' | 'SINGLE' | 'MULTI'>('SELECT');
  const [state, setState] = useState<GameState>('SETUP');
  const [config, setConfig] = useState<GameConfig>({ start: 1, end: 40, timedMode: false, timeLimit: 120 });
  const [won, setWon] = useState(true);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  // Multiplayer state
  const [room, setRoom] = useState<any>(null);

  if (mode === 'SELECT') {
    return (
      <div className="game-screen items-center justify-center relative">
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
        <div className="w-full max-w-md game-panel">
          <div className="flex justify-between items-start mb-6">
            <Illustration emoji="🎯" shape="circle" color="#FF5757" className="scale-[0.5] -ml-6 -mt-6" />
            <div className="flex gap-2">
              <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer transition-transform active:scale-95">
                <Info className="w-6 h-6" />
              </button>
              <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer transition-transform active:scale-95">
                <Home className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">Number Hunt</h1>
          <p className="text-slate-500 font-medium mb-8 text-center leading-relaxed">Find and tap numbers in order as fast as you can.</p>

          <div className="space-y-4">
            <button 
              onClick={() => setMode('SINGLE')}
              className="w-full p-4 sm:p-6 game-card bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🎮" shape="square" color="#5CE1E6" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Single Player</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Find the numbers on your own</div>
              </div>
            </button>
            <button 
              onClick={() => { setMode('MULTI'); setState('SETUP'); }}
              className="w-full p-4 sm:p-6 game-card bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-6 w-full cursor-pointer group"
            >
              <Illustration emoji="🌍" shape="blob" color="#C1FF72" className="scale-[0.6] -ml-4" />
              <div className="text-left">
                <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Online Multiplayer</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Race against your friends</div>
              </div>
            </button>
          </div>
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
