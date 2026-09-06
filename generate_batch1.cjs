const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.writeFileSync(path.join(__dirname, 'src/games', file), content.trim() + '\n');
};

write('OddOneOut/index.tsx', `
import React, { useState, useEffect } from 'react';
import { Home, Lightbulb, RefreshCw } from 'lucide-react';
import { SHARED_ICONS } from '../../lib/icons';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';

type Difficulty = 'easy' | 'medium' | 'hard';
const COUNTS = { easy: 12, medium: 24, hard: 40 };

export function OddOneOut({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [diff, setDiff] = useState<Difficulty>('medium');
  
  const [items, setItems] = useState<{ id: string, iconIdx: number, isTarget: boolean }[]>([]);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [hintActive, setHintActive] = useState(false);
  const [foundId, setFoundId] = useState<string | null>(null);

  const startRound = (d: Difficulty) => {
    setDiff(d);
    const count = COUNTS[d];
    
    // Pick 2 random distinct icons
    const iconIndices = shuffle(Array.from(SHARED_ICONS.keys()));
    const distractorIdx = iconIndices[0];
    const targetIdx = iconIndices[1];
    
    let newItems = Array.from({ length: count - 1 }).map((_, i) => ({
      id: \`d-\${i}\`,
      iconIdx: distractorIdx,
      isTarget: false,
    }));
    
    newItems.push({
      id: 't-1',
      iconIdx: targetIdx,
      isTarget: true,
    });
    
    newItems = shuffle(newItems);
    setItems(newItems);
    setTargetId('t-1');
    setHintActive(false);
    setFoundId(null);
    setState('playing');
    audio.init();
  };

  const handleTap = (item: any) => {
    if (state !== 'playing' || foundId) return;
    
    if (item.isTarget) {
      setFoundId(item.id);
      audio.playComplete();
      setState('completed');
    } else {
      audio.playWrong();
    }
  };

  if (state === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Odd One Out</h1>
          </div>
          <p className="mb-6 text-slate-600">Find the one that is different among identical items.</p>
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
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
          <span className="font-bold text-slate-900 ml-2">Find the different one</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setHintActive(true)} disabled={hintActive || state === 'completed'} className="p-2 text-amber-600 bg-amber-50 rounded-full disabled:opacity-50"><Lightbulb className="w-5 h-5" /></button>
          <button onClick={() => startRound(diff)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          {items.map(item => {
            const Icon = SHARED_ICONS[item.iconIdx];
            const isHinted = hintActive && item.isTarget;
            const isFound = foundId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTap(item)}
                className={\`flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-all \${isFound ? 'bg-green-100 text-green-700 scale-110 shadow-lg' : isHinted ? 'ring-4 ring-amber-400 bg-white text-slate-700' : 'bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50'}\`}
              >
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
              </button>
            )
          })}
        </div>
        
        {state === 'completed' && (
          <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black text-slate-900 mb-6">You found it!</h2>
            <button onClick={() => startRound(diff)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md transition-transform active:scale-95">
              Next Board
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
`);

write('FindTheTwins/index.tsx', `
import React, { useState } from 'react';
import { Home, Lightbulb, RefreshCw } from 'lucide-react';
import { SHARED_ICONS } from '../../lib/icons';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';

type Difficulty = 'easy' | 'medium' | 'hard';
const COUNTS = { easy: 12, medium: 20, hard: 30 };

export function FindTheTwins({ onExit }: { onExit: () => void }) {
  const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [diff, setDiff] = useState<Difficulty>('medium');
  
  const [items, setItems] = useState<{ id: string, iconIdx: number, isPair: boolean }[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hintActive, setHintActive] = useState(false);
  const [foundIds, setFoundIds] = useState<string[]>([]);

  const startRound = (d: Difficulty) => {
    setDiff(d);
    const count = COUNTS[d];
    
    // Select count - 1 distinct icons
    const iconIndices = shuffle(Array.from(SHARED_ICONS.keys())).slice(0, count - 1);
    const pairIconIdx = iconIndices[0]; // First one will be the pair
    
    let newItems = iconIndices.map((idx, i) => ({
      id: \`s-\${i}\`,
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
    setHintActive(false);
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
      setState('completed');
    } else {
      // Mismatch
      audio.playWrong();
      setSelectedId(null);
    }
  };

  if (state === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Find the Twins</h1>
          </div>
          <p className="mb-6 text-slate-600">Exactly two symbols are identical. Find the matching pair.</p>
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
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
          <span className="font-bold text-slate-900 ml-2">Find the matching pair</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setHintActive(true)} disabled={hintActive || state === 'completed'} className="p-2 text-amber-600 bg-amber-50 rounded-full disabled:opacity-50"><Lightbulb className="w-5 h-5" /></button>
          <button onClick={() => startRound(diff)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          {items.map(item => {
            const Icon = SHARED_ICONS[item.iconIdx];
            // Hint highlights ONE of the twins (we pick the first one that is a pair)
            const firstPairId = items.find(i => i.isPair)?.id;
            const isHinted = hintActive && item.id === firstPairId && !foundIds.includes(item.id);
            const isSelected = selectedId === item.id;
            const isFound = foundIds.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleTap(item)}
                className={\`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl transition-all \${isFound ? 'bg-green-100 text-green-700 scale-110 shadow-lg' : isSelected ? 'ring-4 ring-indigo-500 bg-indigo-50 text-indigo-700 scale-105' : isHinted ? 'ring-4 ring-amber-400 bg-white text-slate-700' : 'bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50'}\`}
              >
                <Icon className="w-10 h-10 sm:w-12 sm:h-12" />
              </button>
            )
          })}
        </div>
        
        {state === 'completed' && (
          <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black text-slate-900 mb-6">You found the twins!</h2>
            <button onClick={() => startRound(diff)} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md transition-transform active:scale-95">
              Next Board
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
`);
