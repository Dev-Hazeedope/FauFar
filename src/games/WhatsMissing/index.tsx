import React, { useState } from 'react';
import { Home, RefreshCw } from 'lucide-react';
import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import { SHARED_ICONS } from '../../lib/icons';
import { shuffle } from '../../lib/utils';
import { audio } from '../../lib/audio';

type Phase = 'setup' | 'study' | 'challenge' | 'completed';

export function WhatsMissing({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [totalItems, setTotalItems] = useState(6);
  const [missingCount, setMissingCount] = useState(1);
  
  const [studyItems, setStudyItems] = useState<number[]>([]);
  const [challengeItems, setChallengeItems] = useState<number[]>([]);
  const [missingItems, setMissingItems] = useState<number[]>([]);
  const [choices, setChoices] = useState<number[]>([]);
  
  const [selectedChoices, setSelectedChoices] = useState<number[]>([]);

  const startStudy = (total: number, missing: number) => {
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
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
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          
          <div className="space-y-3">
            <button onClick={() => startStudy(12, 2)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-colors">12 Objects (2 Missing)</button>
            <button onClick={() => startStudy(16, 3)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-colors">16 Objects (3 Missing)</button>
            <button onClick={() => startStudy(20, 4)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-colors">20 Objects (4 Missing)</button>
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
                      className={`p-4 rounded-xl shadow-sm border transition-all ${isSelected ? 'bg-green-100 border-green-300 text-green-700 scale-105' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'}`}
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
