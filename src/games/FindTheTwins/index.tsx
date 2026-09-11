import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import React, { useState } from 'react';
import { Illustration } from '../../components/Illustration';
import { Home, Lightbulb, RefreshCw, Users, User, Info } from 'lucide-react';
import { SHARED_ICONS } from '../../lib/icons';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';
import { haptics } from '../../lib/haptics';
import { MultiplayerSetup } from './multiplayer/MultiplayerSetup';
import { MultiplayerGameplay } from './multiplayer/MultiplayerGameplay';
import { MultiplayerCompletion } from './multiplayer/MultiplayerCompletion';
import { HowToPlayModal } from '../../components/HowToPlayModal';

type Difficulty = 'easy' | 'medium' | 'hard';
const COUNTS = { easy: 20, medium: 30, hard: 40 };

export function FindTheTwins({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<'SELECT' | 'SINGLE' | 'MULTI'>('SELECT');
  const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  // Multiplayer state
  const [room, setRoom] = useState<any>(null);

  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [diff, setDiff] = useState<Difficulty>('medium');
  
  const [items, setItems] = useState<{ id: string, iconIdx: number, isPair: boolean }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [foundIds, setFoundIds] = useState<string[]>([]);

  const startRound = (d: Difficulty) => {
    setDiff(d);
    const count = COUNTS[d];
    
    // Select count - 1 distinct icons
    const iconIndices = shuffle(Array.from(SHARED_ICONS.keys())).slice(0, count - 1);
    const pairIconIdx = iconIndices[0]; // First one will be the pair
    
    let newItems = iconIndices.map((idx, i) => ({
      id: `s-${i}`,
      iconIdx: idx,
      isPair: idx === pairIconIdx,
    }));
    
    // Add the duplicate
    newItems.push({
      id: 's-duplicate',
      iconIdx: pairIconIdx,
      isPair: true,
    });
    
    newItems = shuffle(newItems);
    setItems(newItems);
    setSelectedId(null);
        setFoundIds([]);
    setState('playing');
    audio.init();
  };

  const handleTap = (item: any) => {
    if (state !== 'playing' || foundIds.length > 0) return;
    
    if (selectedId === item.id) {
      setSelectedId(null); // deselect
      return;
    }
    
    if (!selectedId) {
      setSelectedId(item.id);
      audio.playTap();
      return;
    }
    
    const selectedItem = items.find(i => i.id === selectedId);
    if (selectedItem && selectedItem.iconIdx === item.iconIdx) {
      // Match!
      setFoundIds([selectedId, item.id]);
      setSelectedId(null);
      audio.playComplete();
      haptics.vibrateSuccess();
      setState('completed');
    } else {
      // Mismatch
      audio.playWrong();
      haptics.vibrateError();
      setSelectedId(null);
    }
  };

  if (mode === 'SELECT') {
    return (
      <div className="game-screen relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="Find the Twins"
          instructions={[
            "Scan the board to find the one pair of identical icons.",
            "Tap the first icon, then tap its match to win.",
            "In multiplayer, race against your friends to find the twins first!"
          ]}
        />
        <header className="flex items-center gap-4 mb-8 justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer">
              <Home className="w-6 h-6" />
            </button>
            <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none">Find the Twins</h1>
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
              <h2 className="text-2xl font-bold mb-1">Local Play</h2>
              <p className="text-slate-800">Play solo</p>
            </div>
          </button>

          <button
            onClick={() => setMode('MULTI')}
            className="game-card bg-[#C1FF72] p-8 flex flex-col items-center gap-4 w-full cursor-pointer"
          >
            <Illustration emoji="🌍" shape="blob" color="#ffffff" className="scale-75" />
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Multiplayer</h2>
              <p className="text-slate-800">Race against a friend online</p>
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

  if (state === 'setup') {
    return (
      <div className="game-screen items-center justify-center relative">
        <div className="w-full max-w-md game-panel">
          <div className="flex items-center mb-6">
             <button onClick={() => setMode('SELECT')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="game-title-sm ml-2 !text-slate-900 !stroke-none !shadow-none">Local Play</h1>
          </div>
          <p className="mb-6 text-slate-600">Exactly two symbols are identical. Find the matching pair.</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          <div className="space-y-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => startRound(d)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl capitalize transition-colors">
                {d} ({COUNTS[d]} items)
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('SELECT')} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
          <span className="font-bold text-slate-900 ml-2">Local Play</span>
        </div>
        <div className="flex items-center gap-2">
                    <button onClick={() => startRound(diff)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          {items.map(item => {
            const Icon = SHARED_ICONS[item.iconIdx];
            const isSelected = selectedId === item.id;
            const isFound = foundIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleTap(item)}
                className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl transition-all ${isFound ? 'bg-green-100 text-green-700 scale-110 shadow-lg' : isSelected ? 'ring-4 ring-indigo-500 bg-indigo-50 text-indigo-700 scale-105'  : 'bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50'}`}
              >
                <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
              </button>
            )
          })}
        </div>
        
        {state === 'completed' && (
          <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4">
            <h2 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-6">You found the twins!</h2>
            <button onClick={() => startRound(diff)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md transition-transform active:scale-95">
              Next Board
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
