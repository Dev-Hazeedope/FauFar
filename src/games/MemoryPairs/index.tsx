import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import React, { useState } from 'react';
import { Illustration } from '../../components/Illustration';
import { Home, RefreshCw, Users, User, Link, Info } from 'lucide-react';
import { SHARED_ICONS } from '../../lib/icons';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';
import { haptics } from '../../lib/haptics';
import { MultiplayerSetup } from './multiplayer/MultiplayerSetup';
import { MultiplayerGameplay } from './multiplayer/MultiplayerGameplay';
import { MultiplayerCompletion } from './multiplayer/MultiplayerCompletion';
import { HowToPlayModal } from '../../components/HowToPlayModal';

type Mode = 'solo' | 'two';
type Difficulty = 6 | 8 | 12;

interface Card {
  id: string;
  iconIdx: number;
}

export function MemoryPairs({ onExit }: { onExit: () => void }) {
  const [selectMode, setSelectMode] = useState<'SELECT' | 'LOCAL' | 'MULTI'>('SELECT');
  const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  // Multiplayer state
  const [room, setRoom] = useState<any>(null);

  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [mode, setMode] = useState<Mode>('two');
  const [diff, setDiff] = useState<Difficulty>(8);
  
  const [cards, setCards] = useState<Card[]>([]);
  const [revealedIds, setRevealedIds] = useState<string[]>([]); // 1 or 2 currently revealed
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  
  const [player, setPlayer] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [startingPlayer, setStartingPlayer] = useState<1 | 2>(1);

  const startRound = (m: Mode, d: Difficulty, keepStarter: boolean = true) => {
    setMode(m);
    setDiff(d);
    
    const iconIndices = shuffle(Array.from(SHARED_ICONS.keys())).slice(0, d);
    let newCards = iconIndices.map((idx, i) => ({ id: `c1-${i}`, iconIdx: idx }));
    newCards = newCards.concat(iconIndices.map((idx, i) => ({ id: `c2-${i}`, iconIdx: idx })));
    newCards = shuffle(newCards);
    
    setCards(newCards);
    setRevealedIds([]);
    setMatchedIds([]);
    
    if (m === 'two') {
      const p = keepStarter ? startingPlayer : (startingPlayer === 1 ? 2 : 1);
      setStartingPlayer(p);
      setPlayer(p);
      setScores({ 1: 0, 2: 0 });
    } else {
      setScores({ 1: 0, 2: 0 });
    }
    
    setState('playing');
    audio.init();
  };

  const handleCardClick = (id: string) => {
    if (state !== 'playing') return;
    if (matchedIds.includes(id)) return;
    if (revealedIds.length === 2) return; // Wait for manual continue
    if (revealedIds.includes(id)) return;
    
    const newRevealed = [...revealedIds, id];
    setRevealedIds(newRevealed);
    audio.playTap();
    
    if (newRevealed.length === 2) {
      const c1 = cards.find(c => c.id === newRevealed[0]);
      const c2 = cards.find(c => c.id === newRevealed[1]);
      
      if (c1 && c2 && c1.iconIdx === c2.iconIdx) {
        // Match
        audio.playComplete();
        haptics.vibrateSuccess();
        const newMatched = [...matchedIds, c1.id, c2.id];
        setMatchedIds(newMatched);
        setRevealedIds([]); // automatically clear revealed because they are matched
        
        if (mode === 'two') {
          setScores(prev => ({ ...prev, [player]: prev[player] + 1 }));
        } else {
          setScores(prev => ({ ...prev, 1: prev[1] + 1 })); // Solo score
        }
        
        if (newMatched.length === cards.length) {
          setState('completed');
        }
      } else {
        // No match - stay revealed until Continue
        audio.playWrong();
        haptics.vibrateError();
      }
    }
  };

  const handleContinue = () => {
    if (revealedIds.length === 2) {
      setRevealedIds([]);
      if (mode === 'two') {
        setPlayer(p => (p === 1 ? 2 : 1));
      }
    }
  };

  if (selectMode === 'SELECT') {
    return (
      <div className="game-screen relative">
        <HowToPlayModal 
          isOpen={showHowToPlay}
          onClose={() => setShowHowToPlay(false)}
          title="Memory Pairs"
          instructions={[
            "Tap cards to flip them over and reveal their icons.",
            "Try to find matching pairs of icons.",
            "In local multiplayer, take turns flipping cards.",
            "In online multiplayer, race to find pairs as quickly as you can before time runs out!"
          ]}
        />
        <header className="flex items-center gap-4 mb-8 justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onExit} className="game-avatar bg-white hover:bg-slate-200 cursor-pointer">
              <Home className="w-6 h-6" />
            </button>
            <h1 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none">Memory Pairs</h1>
          </div>
          <button onClick={() => setShowHowToPlay(true)} className="game-avatar text-white !bg-[#5CE1E6] hover:!bg-[#4bd8dd] cursor-pointer">
            <Info className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-4">
          <button
            onClick={() => setSelectMode('LOCAL')}
            className="game-card bg-[#5CE1E6] p-8 flex flex-col items-center gap-4 w-full cursor-pointer"
          >
            <Illustration emoji="🎮" shape="square" color="#ffffff" className="scale-75" />
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Local Play</h2>
              <p className="text-slate-800">Play solo or pass & play</p>
            </div>
          </button>

          <button
            onClick={() => setSelectMode('MULTI')}
            className="game-card bg-[#C1FF72] p-8 flex flex-col items-center gap-4 w-full cursor-pointer"
          >
            <div className="w-16 h-16 bg-white shadow-[2px_2px_0_0_#0f172a] border-4 border-slate-900 rounded-2xl flex items-center justify-center">
              <Link className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Online Multiplayer</h2>
              <p className="text-slate-800">Play with a friend remotely</p>
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

  if (state === 'setup') {
    return (
      <div className="game-screen items-center justify-center relative">
        <div className="w-full max-w-md game-panel">
          <div className="flex items-center mb-6">
             <button onClick={() => setSelectMode('SELECT')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="game-title-sm ml-2 !text-slate-900 !stroke-none !shadow-none">Local Play</h1>
          </div>
          <p className="mb-6 text-slate-600">Find matching pairs. Leave non-matches visible until you're ready.</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          
          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode('solo')} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'solo' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <User className="w-5 h-5" /> Solo
            </button>
            <button onClick={() => setMode('two')} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'two' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Users className="w-5 h-5" /> 2 Players
            </button>
          </div>

          <div className="space-y-3">
            {([6, 8, 12] as Difficulty[]).map(d => (
              <button key={d} onClick={() => startRound(mode, d, true)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-colors">
                {d} Pairs ({d * 2} cards)
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getWinner = () => {
    if (scores[1] > scores[2]) return 'Player 1 Wins!';
    if (scores[2] > scores[1]) return 'Player 2 Wins!';
    return 'Draw!';
  };

  return (
    <div className="game-screen">
      <header className="flex flex-col p-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10 gap-4">
        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={state === 'playing'} onTimeUp={() => { setIsTimeUp(true); setState('completed'); }} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectMode('SELECT')} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 ml-2">Local Play</span>
          </div>
          <button onClick={() => startRound(mode, diff, true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
        
        {mode === 'two' && (
          <div className="flex items-center justify-between px-2">
            <div className={`font-bold px-3 py-1 rounded-full ${player === 1 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>P1: {scores[1]}</div>
            <div className={`font-bold px-3 py-1 rounded-full ${player === 2 ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>P2: {scores[2]}</div>
          </div>
        )}
        {mode === 'solo' && (
          <div className="text-center font-bold text-slate-600">Pairs Found: {scores[1]} / {diff}</div>
        )}
      </header>

      <main className="flex-1 p-4 flex flex-col items-center">
        <div className="w-full max-w-4xl flex-1 flex flex-wrap justify-center content-center gap-3">
          {cards.map((card, i) => {
            const isRevealed = revealedIds.includes(card.id) || matchedIds.includes(card.id);
            const Icon = SHARED_ICONS[card.iconIdx];
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                aria-label={isRevealed ? "Card face up" : `Card ${i + 1} face down`}
                className={`flex items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-xl transition-all shadow-sm border ${isRevealed ? 'bg-white border-slate-200 text-slate-800 scale-100' : 'bg-indigo-100 border-indigo-200 text-transparent scale-95 hover:scale-100 hover:bg-indigo-200'}`}
              >
                {isRevealed && <Icon className="w-10 h-10 sm:w-12 sm:h-12" />}
              </button>
            )
          })}
        </div>
        
        <div className="h-24 flex items-center justify-center shrink-0 w-full">
          {revealedIds.length === 2 && (
            <button onClick={handleContinue} className="px-8 py-4 bg-slate-800 text-white font-bold rounded-full shadow-md animate-in fade-in slide-in-from-bottom-2">
              {mode === 'two' ? 'End Turn' : 'Continue'}
            </button>
          )}
          {state === 'completed' && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-2">
              <h2 className="game-title-sm text-center mb-4 !text-slate-900 !stroke-none !shadow-none mb-2">{mode === 'two' ? getWinner() : 'All pairs found!'}</h2>
              <button onClick={() => startRound(mode, diff, false)} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-md">
                Play Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
