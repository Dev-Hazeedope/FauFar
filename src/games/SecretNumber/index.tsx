import React, { useState, useEffect } from 'react';
import { Users, User, Home, Dices, Info } from 'lucide-react';
import { Illustration } from '../../components/Illustration';
import { MultiplayerSetup } from './multiplayer/MultiplayerSetup';
import { MultiplayerGameplay } from './multiplayer/MultiplayerGameplay';
import { MultiplayerCompletion } from './multiplayer/MultiplayerCompletion';
import { SinglePlayer } from './singleplayer/SinglePlayer';
import { HowToPlayModal } from '../../components/HowToPlayModal';
import { audio } from '../../lib/audio';

type Mode = 'SELECT' | 'SINGLE' | 'MULTI';
type MultiState = 'SETUP' | 'LOBBY_OR_PLAYING' | 'COMPLETED';

interface Props {
  onExit: () => void;
}

export function SecretNumber({ onExit }: Props) {
  useEffect(() => {
    // Start BGM when entering the game
    audio.playBGM();
    return () => {
      // Stop BGM when leaving the game
      audio.stopBGM();
    };
  }, []);

  const [mode, setMode] = useState<Mode>('SELECT');
  const [multiState, setMultiState] = useState<MultiState>('SETUP');
  const [room, setRoom] = useState<any>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  if (mode === 'SINGLE') {
    return <SinglePlayer onExit={() => setMode('SELECT')} />;
  }

  if (mode === 'MULTI') {
    if (multiState === 'SETUP') {
      return (
        <MultiplayerSetup 
          onBack={() => setMode('SELECT')}
          onJoinRoom={(r) => {
            setRoom(r);
            setMultiState('LOBBY_OR_PLAYING');
          }}
        />
      );
    }
    
    if (multiState === 'LOBBY_OR_PLAYING') {
      return (
        <MultiplayerGameplay 
          room={room}
          onLeave={() => {
            setRoom(null);
            setMultiState('SETUP');
            setMode('SELECT');
          }}
          onGameEnded={(r) => {
            setRoom(r);
            setMultiState('COMPLETED');
          }}
          onRoomUpdated={setRoom}
        />
      );
    }
    
    if (multiState === 'COMPLETED') {
      return (
        <MultiplayerCompletion 
          room={room}
          onLeave={() => {
            setRoom(null);
            setMultiState('SETUP');
            setMode('SELECT');
          }}
          onRoomUpdated={(r) => {
            setRoom(r);
            if (r.state === 'playing') {
              setMultiState('LOBBY_OR_PLAYING');
            }
          }}
        />
      );
    }
  }

  return (
    <div className="game-screen items-center justify-center relative">
      <HowToPlayModal 
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        title="Secret Number"
        instructions={[
          "The app has chosen a secret number within the specified range.",
          "Type your guess and submit it.",
          "You will receive a clue: 'Higher' if the secret number is greater than your guess, or 'Lower' if it is smaller.",
          "Use these clues to narrow down the range and find the secret number as quickly as possible!",
          "In multiplayer, race against your friends to be the first to guess the correct number."
        ]}
      />
      <div className="w-full max-w-md game-panel">
        <div className="flex justify-between items-start mb-6">
          <Illustration emoji="🤫" shape="square" color="#FF914D" className="scale-[0.5] -ml-6 -mt-6" />
          <div className="flex gap-2">
            <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer">
              <Info className="w-6 h-6" />
            </button>
            <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer">
              <Home className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">Secret Number</h1>
        <p className="text-slate-500 font-medium mb-8">Guess a hidden number based on higher/lower clues.</p>

        <div className="space-y-4">
          <button 
            onClick={() => setMode('SINGLE')}
            className="w-full p-4 sm:p-6 game-card bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-6 w-full cursor-pointer group"
          >
            <Illustration emoji="🎮" shape="square" color="#5CE1E6" className="scale-[0.6] -ml-4" />
            <div className="text-left">
              <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Single Player</div>
              <div className="text-sm text-slate-500 font-medium mt-1">Play solo against the app</div>
            </div>
          </button>

          <button 
            onClick={() => { setMode('MULTI'); setMultiState('SETUP'); }}
            className="w-full p-4 sm:p-6 game-card bg-white p-4 sm:p-6 flex items-center gap-4 sm:gap-6 w-full cursor-pointer group"
          >
            <Illustration emoji="🌍" shape="blob" color="#C1FF72" className="scale-[0.6] -ml-4" />
            <div className="text-left">
              <div className="font-black text-lg text-slate-800 group-hover:text-indigo-900">Online Multiplayer</div>
              <div className="text-sm text-slate-500 font-medium mt-1">Play with a friend</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
