const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.writeFileSync(path.join(__dirname, 'src/games', file), content.trim() + '\n');
};

write('MemoryPairs/index.tsx', `
import React, { useState } from 'react';
import { Home, RefreshCw, Users, User } from 'lucide-react';
import { SHARED_ICONS } from '../../lib/icons';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';

type Mode = 'solo' | 'two';
type Difficulty = 6 | 8 | 12;

interface Card {
  id: string;
  iconIdx: number;
}

export function MemoryPairs({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');
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
    let newCards = iconIndices.map((idx, i) => ({ id: \`c1-\${i}\`, iconIdx: idx }));
    newCards = newCards.concat(iconIndices.map((idx, i) => ({ id: \`c2-\${i}\`, iconIdx: idx })));
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

  if (state === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Memory Pairs</h1>
          </div>
          <p className="mb-6 text-slate-600">Find matching pairs. Leave non-matches visible until you're ready.</p>
          
          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode('solo')} className={\`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors \${mode === 'solo' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>
              <User className="w-5 h-5" /> Solo
            </button>
            <button onClick={() => setMode('two')} className={\`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors \${mode === 'two' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>
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
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex flex-col p-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 ml-2">Memory Pairs</span>
          </div>
          <button onClick={() => startRound(mode, diff, true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
        
        {mode === 'two' && (
          <div className="flex items-center justify-between px-2">
            <div className={\`font-bold px-3 py-1 rounded-full \${player === 1 ? 'bg-indigo-600 text-white' : 'text-slate-500'}\`}>P1: {scores[1]}</div>
            <div className={\`font-bold px-3 py-1 rounded-full \${player === 2 ? 'bg-emerald-600 text-white' : 'text-slate-500'}\`}>P2: {scores[2]}</div>
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
                aria-label={isRevealed ? "Card face up" : \`Card \${i + 1} face down\`}
                className={\`flex items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-xl transition-all shadow-sm border \${isRevealed ? 'bg-white border-slate-200 text-slate-800 scale-100' : 'bg-indigo-100 border-indigo-200 text-transparent scale-95 hover:scale-100 hover:bg-indigo-200'}\`}
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
              <h2 className="text-2xl font-black text-slate-900 mb-2">{mode === 'two' ? getWinner() : 'All pairs found!'}</h2>
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
`);

write('WhatsMissing/index.tsx', `
import React, { useState } from 'react';
import { Home, RefreshCw } from 'lucide-react';
import { SHARED_ICONS } from '../../lib/icons';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';

type Phase = 'setup' | 'study' | 'challenge' | 'completed';

export function WhatsMissing({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [totalItems, setTotalItems] = useState(6);
  const [missingCount, setMissingCount] = useState(1);
  
  const [studyItems, setStudyItems] = useState<number[]>([]);
  const [challengeItems, setChallengeItems] = useState<number[]>([]);
  const [missingItems, setMissingItems] = useState<number[]>([]);
  const [choices, setChoices] = useState<number[]>([]);
  
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);

  const startStudy = (total: number, missing: number) => {
    setTotalItems(total);
    setMissingCount(missing);
    
    const iconIndices = shuffle(Array.from(SHARED_ICONS.keys()));
    const items = iconIndices.slice(0, total);
    
    setStudyItems(items);
    setPhase('study');
    audio.init();
  };

  const startChallenge = () => {
    const shuffledStudy = shuffle([...studyItems]);
    const mItems = shuffledStudy.slice(0, missingCount);
    const remItems = shuffledStudy.slice(missingCount);
    
    setMissingItems(mItems);
    setChallengeItems(shuffle(remItems));
    
    // distractors are icons not in the original collection
    const otherIndices = Array.from(SHARED_ICONS.keys()).filter(idx => !studyItems.includes(idx));
    const distractors = shuffle(otherIndices).slice(0, 3);
    
    setChoices(shuffle([...mItems, ...distractors]));
    setSelectedChoices([]);
    setPhase('challenge');
  };

  const handleChoice = (idx: number) => {
    if (phase !== 'challenge') return;
    if (selectedChoices.includes(idx)) return;
    
    if (missingItems.includes(idx)) {
      audio.playTap();
      const newSelected = [...selectedChoices, idx];
      setSelectedChoices(newSelected);
      
      if (newSelected.length === missingCount) {
        audio.playComplete();
        setPhase('completed');
      }
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
             <h1 className="text-2xl font-black ml-2 text-slate-900">What's Missing?</h1>
          </div>
          <p className="mb-6 text-slate-600">Study the objects. After they hide, identify what disappeared.</p>
          
          <div className="space-y-3">
            <button onClick={() => startStudy(6, 1)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-colors">6 Objects (1 Missing)</button>
            <button onClick={() => startStudy(9, 1)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-colors">9 Objects (1 Missing)</button>
            <button onClick={() => startStudy(12, 2)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-colors">12 Objects (2 Missing)</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
          <span className="font-bold text-slate-900 ml-2">What's Missing?</span>
        </div>
        <button onClick={() => startStudy(totalItems, missingCount)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center">
        {phase === 'study' && (
          <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in">
            <h2 className="text-2xl font-bold text-slate-700 mb-8 text-center">Study the objects.<br/><span className="text-lg font-normal text-slate-500">Tap Ready when you have memorized them.</span></h2>
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {studyItems.map(idx => {
                const Icon = SHARED_ICONS[idx];
                return <div key={idx} className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200"><Icon className="w-12 h-12 text-slate-800" /></div>;
              })}
            </div>
            <button onClick={startChallenge} className="px-10 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-md active:scale-95 transition-transform">Ready</button>
          </div>
        )}

        {(phase === 'challenge' || phase === 'completed') && (
          <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in">
            {phase === 'challenge' ? (
              <h2 className="text-2xl font-bold text-slate-700 mb-8">What disappeared?</h2>
            ) : (
              <h2 className="text-2xl font-black text-indigo-600 mb-8">You found them all!</h2>
            )}
            
            <div className="flex flex-wrap justify-center gap-4 mb-12 opacity-50 pointer-events-none scale-90">
              {challengeItems.map(idx => {
                const Icon = SHARED_ICONS[idx];
                return <div key={idx} className="p-3 bg-white rounded-xl shadow-sm border border-slate-200"><Icon className="w-8 h-8 text-slate-600" /></div>;
              })}
              {phase === 'completed' && missingItems.map(idx => {
                const Icon = SHARED_ICONS[idx];
                return <div key={idx} className="p-3 bg-green-50 rounded-xl shadow-sm border border-green-200 ring-2 ring-green-400"><Icon className="w-8 h-8 text-green-700" /></div>;
              })}
            </div>

            <div className="w-full max-w-lg mx-auto bg-slate-100 p-6 rounded-3xl border border-slate-200">
              <h3 className="font-bold text-slate-500 mb-4 text-center">Choices</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {choices.map(idx => {
                  const Icon = SHARED_ICONS[idx];
                  const isSelected = selectedChoices.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleChoice(idx)}
                      disabled={isSelected || phase === 'completed'}
                      className={\`p-4 rounded-xl shadow-sm border transition-all \${isSelected ? 'bg-green-100 border-green-300 text-green-700 scale-105' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}\`}
                    >
                      <Icon className="w-10 h-10" />
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              {phase === 'challenge' && (
                <button onClick={() => setPhase('completed')} className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-full">Reveal & End</button>
              )}
              {phase === 'completed' && (
                <button onClick={() => startStudy(totalItems, missingCount)} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-md active:scale-95 transition-transform">Next Board</button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
`);
