import React, { useState } from 'react';
import { Home, RefreshCw } from 'lucide-react';
import { TimerSetup } from '../../components/TimerSetup';
import { TimerDisplay } from '../../components/TimerDisplay';
import { audio } from '../../lib/audio';

type Phase = 'setup' | 'playing' | 'completed';
type BoardSize = 4 | 6 | 8; // dots per side

export function DotsAndBoxes({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<any>('setup');
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [size, setSize] = useState<BoardSize>(6);
  
  const [hEdges, setHEdges] = useState<Record<string, number>>({}); // "r,c" -> player
  const [vEdges, setVEdges] = useState<Record<string, number>>({}); // "r,c" -> player
  const [boxes, setBoxes] = useState<Record<string, number>>({}); // "r,c" -> player
  
  const [player, setPlayer] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [startingPlayer, setStartingPlayer] = useState<1 | 2>(1);

  const startRound = (sz: BoardSize, keepStarter = true) => {
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
    setTimeLeft(timeLimit);
    setIsTimeUp(false);
    setSize(sz);
    setHEdges({});
    setVEdges({});
    setBoxes({});
    
    const p = keepStarter ? startingPlayer : (startingPlayer === 1 ? 2 : 1);
    setStartingPlayer(p);
    setPlayer(p);
    setScores({ 1: 0, 2: 0 });
    setPhase('playing');
    audio.init();
  };

  const handleEdgeClick = (type: 'h' | 'v', r: number, c: number) => {
    if (phase !== 'playing') return;
    
    const edges = type === 'h' ? hEdges : vEdges;
    const key = `${r},${c}`;
    
    if (edges[key]) return; // already claimed
    
    const newHEdges = { ...hEdges };
    const newVEdges = { ...vEdges };
    if (type === 'h') newHEdges[key] = player;
    else newVEdges[key] = player;
    
    // Check boxes
    let boxesCompleted = 0;
    const newBoxes = { ...boxes };
    
    const checkAndClaimBox = (br: number, bc: number) => {
      if (newBoxes[`${br},${bc}`]) return 0;
      if (
        newHEdges[`${br},${bc}`] && // top
        newHEdges[`${br+1},${bc}`] && // bottom
        newVEdges[`${br},${bc}`] && // left
        newVEdges[`${br},${bc+1}`] // right
      ) {
        newBoxes[`${br},${bc}`] = player;
        return 1;
      }
      return 0;
    };
    
    if (type === 'h') {
      if (r > 0) boxesCompleted += checkAndClaimBox(r - 1, c); // box above
      if (r < size - 1) boxesCompleted += checkAndClaimBox(r, c); // box below
    } else {
      if (c > 0) boxesCompleted += checkAndClaimBox(r, c - 1); // box left
      if (c < size - 1) boxesCompleted += checkAndClaimBox(r, c); // box right
    }
    
    setHEdges(newHEdges);
    setVEdges(newVEdges);
    
    if (boxesCompleted > 0) {
      audio.playComplete();
      setBoxes(newBoxes);
      setScores(s => ({ ...s, [player]: s[player] + boxesCompleted }));
      
      const totalBoxes = (size - 1) * (size - 1);
      if (Object.keys(newBoxes).length === totalBoxes) {
        setPhase('completed');
      }
    } else {
      audio.playTap();
      setPlayer(p => (p === 1 ? 2 : 1));
    }
  };

  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Dots & Boxes</h1>
          </div>
          <p className="mb-6 text-slate-600">Connect dots to claim boxes. Completing a box gives you another turn!</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          
          <div className="space-y-3">
            {[4, 6, 8].map(s => {
               const sz = s as BoardSize;
               const boxCount = (sz - 1) * (sz - 1);
               return (
                 <button key={sz} onClick={() => startRound(sz, true)} className="w-full py-4 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold rounded-xl transition-colors">
                   {sz}x{sz} Dots ({boxCount} boxes)
                 </button>
               );
            })}
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
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset overflow-hidden">
      <header className="flex flex-col p-4 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0 gap-4">
        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 ml-2">Dots & Boxes</span>
          </div>
          <button onClick={() => startRound(size, true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className={`font-bold px-4 py-1.5 rounded-full ${player === 1 ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'} transition-all`}>P1: {scores[1]}</div>
          {phase === 'completed' && <div className="font-black text-slate-900 text-lg animate-in zoom-in">{getWinner()}</div>}
          <div className={`font-bold px-4 py-1.5 rounded-full ${player === 2 ? 'bg-emerald-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'} transition-all`}>P2: {scores[2]}</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* The Grid */}
        <div 
          className="relative select-none touch-none"
          style={{
             width: `${(size - 1) * 60 + 20}px`,
             height: `${(size - 1) * 60 + 20}px`
          }}
        >
          {/* Boxes */}
          {Array.from({ length: size - 1 }).map((_, r) => 
            Array.from({ length: size - 1 }).map((_, c) => {
              const p = boxes[`${r},${c}`];
              if (!p) return null;
              return (
                <div 
                  key={`box-${r}-${c}`}
                  className={`absolute w-[60px] h-[60px] flex items-center justify-center text-3xl font-black opacity-80 animate-in zoom-in ${p === 1 ? 'text-indigo-200 bg-indigo-50' : 'text-emerald-200 bg-emerald-50'}`}
                  style={{ top: r * 60 + 10, left: c * 60 + 10 }}
                >
                  {p === 1 ? 'P1' : 'P2'}
                </div>
              );
            })
          )}

          {/* Horizontal Edges */}
          {Array.from({ length: size }).map((_, r) => 
            Array.from({ length: size - 1 }).map((_, c) => {
              const p = hEdges[`${r},${c}`];
              return (
                <button
                  key={`h-${r}-${c}`}
                  onClick={() => handleEdgeClick('h', r, c)}
                  disabled={!!p || phase === 'completed'}
                  aria-label={`Horizontal edge row ${r}, column ${c}`}
                  className={`absolute h-10 w-[60px] -translate-y-5 z-10 flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                  style={{ top: r * 60 + 10, left: c * 60 + 10 }}
                >
                  <div className={`h-2 w-[56px] rounded-full transition-colors ${p === 1 ? 'bg-indigo-500' : p === 2 ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-slate-200'}`} />
                </button>
              );
            })
          )}

          {/* Vertical Edges */}
          {Array.from({ length: size - 1 }).map((_, r) => 
            Array.from({ length: size }).map((_, c) => {
              const p = vEdges[`${r},${c}`];
              return (
                <button
                  key={`v-${r}-${c}`}
                  onClick={() => handleEdgeClick('v', r, c)}
                  disabled={!!p || phase === 'completed'}
                  aria-label={`Vertical edge row ${r}, column ${c}`}
                  className={`absolute w-10 h-[60px] -translate-x-5 z-10 flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                  style={{ top: r * 60 + 10, left: c * 60 + 10 }}
                >
                  <div className={`w-2 h-[56px] rounded-full transition-colors ${p === 1 ? 'bg-indigo-500' : p === 2 ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-slate-200'}`} />
                </button>
              );
            })
          )}

          {/* Dots */}
          {Array.from({ length: size }).map((_, r) => 
            Array.from({ length: size }).map((_, c) => (
              <div 
                key={`dot-${r}-${c}`}
                className="absolute w-4 h-4 rounded-full bg-slate-300 pointer-events-none z-20 shadow-sm"
                style={{ top: r * 60 + 10 - 8, left: c * 60 + 10 - 8 }}
              />
            ))
          )}
        </div>

        {phase === 'completed' && (
          <div className="mt-12">
            <button onClick={() => startRound(size, false)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform">
              Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
