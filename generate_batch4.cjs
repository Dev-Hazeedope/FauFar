const fs = require('fs');
const path = require('path');

const write = (file, content) => {
  fs.writeFileSync(path.join(__dirname, 'src/games', file), content.trim() + '\n');
};

write('DotsAndBoxes/index.tsx', `
import React, { useState } from 'react';
import { Home, RefreshCw } from 'lucide-react';
import { audio } from '../../lib/audio';

type Phase = 'setup' | 'playing' | 'completed';
type BoardSize = 3 | 4 | 5; // dots per side

export function DotsAndBoxes({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [size, setSize] = useState<BoardSize>(4);
  
  const [hEdges, setHEdges] = useState<Record<string, number>>({}); // "r,c" -> player
  const [vEdges, setVEdges] = useState<Record<string, number>>({}); // "r,c" -> player
  const [boxes, setBoxes] = useState<Record<string, number>>({}); // "r,c" -> player
  
  const [player, setPlayer] = useState<1 | 2>(1);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [startingPlayer, setStartingPlayer] = useState<1 | 2>(1);

  const startRound = (sz: BoardSize, keepStarter = true) => {
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
    const key = \`\${r},\${c}\`;
    
    if (edges[key]) return; // already claimed
    
    const newHEdges = { ...hEdges };
    const newVEdges = { ...vEdges };
    if (type === 'h') newHEdges[key] = player;
    else newVEdges[key] = player;
    
    // Check boxes
    let boxesCompleted = 0;
    const newBoxes = { ...boxes };
    
    const checkAndClaimBox = (br: number, bc: number) => {
      if (newBoxes[\`\${br},\${bc}\`]) return 0;
      if (
        newHEdges[\`\${br},\${bc}\`] && // top
        newHEdges[\`\${br+1},\${bc}\`] && // bottom
        newVEdges[\`\${br},\${bc}\`] && // left
        newVEdges[\`\${br},\${bc+1}\`] // right
      ) {
        newBoxes[\`\${br},\${bc}\`] = player;
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
          
          <div className="space-y-3">
            {[3, 4, 5].map(s => {
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 ml-2">Dots & Boxes</span>
          </div>
          <button onClick={() => startRound(size, true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className={\`font-bold px-4 py-1.5 rounded-full \${player === 1 ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'} transition-all\`}>P1: {scores[1]}</div>
          {phase === 'completed' && <div className="font-black text-slate-900 text-lg animate-in zoom-in">{getWinner()}</div>}
          <div className={\`font-bold px-4 py-1.5 rounded-full \${player === 2 ? 'bg-emerald-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'} transition-all\`}>P2: {scores[2]}</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* The Grid */}
        <div 
          className="relative select-none touch-none"
          style={{
             width: \`\${(size - 1) * 60 + 20}px\`,
             height: \`\${(size - 1) * 60 + 20}px\`
          }}
        >
          {/* Boxes */}
          {Array.from({ length: size - 1 }).map((_, r) => 
            Array.from({ length: size - 1 }).map((_, c) => {
              const p = boxes[\`\${r},\${c}\`];
              if (!p) return null;
              return (
                <div 
                  key={\`box-\${r}-\${c}\`}
                  className={\`absolute w-[60px] h-[60px] flex items-center justify-center text-3xl font-black opacity-80 animate-in zoom-in \${p === 1 ? 'text-indigo-200 bg-indigo-50' : 'text-emerald-200 bg-emerald-50'}\`}
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
              const p = hEdges[\`\${r},\${c}\`];
              return (
                <button
                  key={\`h-\${r}-\${c}\`}
                  onClick={() => handleEdgeClick('h', r, c)}
                  disabled={!!p || phase === 'completed'}
                  aria-label={\`Horizontal edge row \${r}, column \${c}\`}
                  className={\`absolute h-10 w-[60px] -translate-y-5 z-10 flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-offset-2\`}
                  style={{ top: r * 60 + 10, left: c * 60 + 10 }}
                >
                  <div className={\`h-2 w-[56px] rounded-full transition-colors \${p === 1 ? 'bg-indigo-500' : p === 2 ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-slate-200'}\`} />
                </button>
              );
            })
          )}

          {/* Vertical Edges */}
          {Array.from({ length: size - 1 }).map((_, r) => 
            Array.from({ length: size }).map((_, c) => {
              const p = vEdges[\`\${r},\${c}\`];
              return (
                <button
                  key={\`v-\${r}-\${c}\`}
                  onClick={() => handleEdgeClick('v', r, c)}
                  disabled={!!p || phase === 'completed'}
                  aria-label={\`Vertical edge row \${r}, column \${c}\`}
                  className={\`absolute w-10 h-[60px] -translate-x-5 z-10 flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-offset-2\`}
                  style={{ top: r * 60 + 10, left: c * 60 + 10 }}
                >
                  <div className={\`w-2 h-[56px] rounded-full transition-colors \${p === 1 ? 'bg-indigo-500' : p === 2 ? 'bg-emerald-500' : 'bg-transparent group-hover:bg-slate-200'}\`} />
                </button>
              );
            })
          )}

          {/* Dots */}
          {Array.from({ length: size }).map((_, r) => 
            Array.from({ length: size }).map((_, c) => (
              <div 
                key={\`dot-\${r}-\${c}\`}
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
`);

write('FourInARow/index.tsx', `
import React, { useState } from 'react';
import { Home, RefreshCw } from 'lucide-react';
import { audio } from '../../lib/audio';

type Phase = 'playing' | 'completed';

const COLS = 7;
const ROWS = 6;

export function FourInARow({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('playing');
  
  // board[c][r] - bottom is r=0
  const [board, setBoard] = useState<(1 | 2 | null)[][]>(
    Array.from({ length: COLS }, () => Array(ROWS).fill(null))
  );
  
  const [player, setPlayer] = useState<1 | 2>(1);
  const [startingPlayer, setStartingPlayer] = useState<1 | 2>(1);
  const [winLine, setWinLine] = useState<{c:number, r:number}[]>([]);
  const [isDraw, setIsDraw] = useState(false);

  const startRound = (keepStarter = true) => {
    setBoard(Array.from({ length: COLS }, () => Array(ROWS).fill(null)));
    const p = keepStarter ? startingPlayer : (startingPlayer === 1 ? 2 : 1);
    setStartingPlayer(p);
    setPlayer(p);
    setWinLine([]);
    setIsDraw(false);
    setPhase('playing');
    audio.init();
  };

  const checkWin = (b: (1|2|null)[][], c: number, r: number, p: 1|2) => {
    const dirs = [[1,0], [0,1], [1,1], [1,-1]];
    for (const [dc, dr] of dirs) {
      let count = 1;
      const line = [{c, r}];
      
      // forward
      let nc = c + dc; let nr = r + dr;
      while (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && b[nc][nr] === p) {
        count++;
        line.push({c:nc, r:nr});
        nc += dc; nr += dr;
      }
      
      // backward
      nc = c - dc; nr = r - dr;
      while (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && b[nc][nr] === p) {
        count++;
        line.push({c:nc, r:nr});
        nc -= dc; nr -= dr;
      }
      
      if (count >= 4) return line;
    }
    return null;
  };

  const dropPiece = (col: number) => {
    if (phase !== 'playing') return;
    
    const column = board[col];
    const r = column.findIndex(cell => cell === null);
    if (r === -1) return; // Full
    
    const newBoard = [...board];
    newBoard[col] = [...column];
    newBoard[col][r] = player;
    setBoard(newBoard);
    
    const win = checkWin(newBoard, col, r, player);
    if (win) {
      audio.playComplete();
      setWinLine(win);
      setPhase('completed');
    } else {
      // Check draw
      const isFull = newBoard.every(c => c[ROWS - 1] !== null);
      if (isFull) {
        audio.playWrong();
        setIsDraw(true);
        setPhase('completed');
      } else {
        audio.playTap();
        setPlayer(p => p === 1 ? 2 : 1);
      }
    }
  };

  const getWinner = () => {
    if (isDraw) return 'Draw!';
    return \`Player \${player} Wins!\`;
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex flex-col p-4 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 ml-2">Four in a Row</span>
          </div>
          <button onClick={() => startRound(true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className={\`font-bold px-4 py-1.5 rounded-full \${player === 1 && phase === 'playing' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}\`}>P1 (Blue)</div>
          {phase === 'completed' && <div className="font-black text-slate-900 text-lg animate-in zoom-in">{getWinner()}</div>}
          <div className={\`font-bold px-4 py-1.5 rounded-full \${player === 2 && phase === 'playing' ? 'bg-rose-500 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}\`}>P2 (Red)</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="flex bg-blue-100 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-inner gap-1 sm:gap-2">
          {Array.from({ length: COLS }).map((_, c) => (
            <button
              key={c}
              onClick={() => dropPiece(c)}
              disabled={phase !== 'playing' || board[c][ROWS - 1] !== null}
              aria-label={\`Drop in column \${c + 1}\`}
              className="flex flex-col-reverse gap-1 sm:gap-2 outline-none group"
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-50 transition-opacity bg-indigo-600 pointer-events-none" style={{ backgroundColor: player === 1 ? '#4f46e5' : '#f43f5e' }} />
              
              {Array.from({ length: ROWS }).map((_, r) => {
                const cell = board[c][r];
                const isWin = winLine.some(loc => loc.c === c && loc.r === r);
                return (
                  <div 
                    key={r}
                    className={\`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shadow-inner transition-all duration-300 \${
                      cell === 1 ? 'bg-indigo-600' :
                      cell === 2 ? 'bg-rose-500' :
                      'bg-[#fdfbf7]'
                    } \${isWin ? 'ring-4 ring-white scale-110 z-10 shadow-lg' : ''}\`}
                  />
                );
              })}
            </button>
          ))}
        </div>
        
        {phase === 'completed' && (
          <div className="mt-8">
            <button onClick={() => startRound(false)} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-md">
              Play Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
`);

write('TakeTheLastToken/index.tsx', `
import React, { useState } from 'react';
import { Home, RefreshCw, Layers } from 'lucide-react';
import { audio } from '../../lib/audio';

type Phase = 'setup' | 'playing' | 'completed';
type Rule = 'standard' | 'reverse';

export function TakeTheLastToken({ onExit }: { onExit: () => void }) {
  const [phase, setPhase] = useState<Phase>('setup');
  
  const [initialCount, setInitialCount] = useState('21');
  const [rule, setRule] = useState<Rule>('standard');
  
  const [tokens, setTokens] = useState(0);
  const [player, setPlayer] = useState<1 | 2>(1);
  const [startingPlayer, setStartingPlayer] = useState<1 | 2>(1);
  const [lastMove, setLastMove] = useState('');

  const startRound = (keepStarter = true) => {
    let count = parseInt(initialCount);
    if (isNaN(count) || count < 5 || count > 60) return;
    
    setTokens(count);
    const p = keepStarter ? startingPlayer : (startingPlayer === 1 ? 2 : 1);
    setStartingPlayer(p);
    setPlayer(p);
    setLastMove('Game started.');
    setPhase('playing');
    audio.init();
  };

  const take = (amount: number) => {
    if (phase !== 'playing') return;
    if (amount > tokens || amount < 1 || amount > 3) return;
    
    const remaining = tokens - amount;
    setTokens(remaining);
    
    if (remaining === 0) {
      audio.playComplete();
      setPhase('completed');
      setLastMove(\`Player \${player} took \${amount}. Pile is empty.\`);
    } else {
      audio.playTap();
      setLastMove(\`Player \${player} took \${amount}.\`);
      setPlayer(p => p === 1 ? 2 : 1);
    }
  };

  const getWinner = () => {
    if (rule === 'standard') {
      // Last taker wins
      return \`Player \${player} Wins!\`;
    } else {
      // Last taker loses
      const winner = player === 1 ? 2 : 1;
      return \`Player \${winner} Wins!\`;
    }
  };

  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[#fdfbf7] p-6 text-slate-800">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
             <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
             <h1 className="text-2xl font-black ml-2 text-slate-900">Take the Last Token</h1>
          </div>
          <p className="mb-6 text-slate-600">Take 1, 2, or 3 tokens on your turn.</p>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-600 mb-2">Starting Pile (5-60)</label>
            <div className="flex gap-2 mb-2">
               <button onClick={() => setInitialCount('15')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '15' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>15</button>
               <button onClick={() => setInitialCount('21')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '21' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>21</button>
               <button onClick={() => setInitialCount('30')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '30' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>30</button>
            </div>
            <input type="number" min="5" max="60" value={initialCount} onChange={e => setInitialCount(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500" placeholder="Custom..." />
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-600 mb-2">Rule</label>
            <div className="flex gap-2">
               <button onClick={() => setRule('standard')} className={\`flex-1 py-3 rounded-xl font-bold flex flex-col items-center gap-1 \${rule === 'standard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>
                 Standard
                 <span className={\`text-xs font-normal \${rule === 'standard' ? 'text-indigo-200' : 'text-slate-500'}\`}>Last token wins</span>
               </button>
               <button onClick={() => setRule('reverse')} className={\`flex-1 py-3 rounded-xl font-bold flex flex-col items-center gap-1 \${rule === 'reverse' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>
                 Reverse
                 <span className={\`text-xs font-normal \${rule === 'reverse' ? 'text-indigo-200' : 'text-slate-500'}\`}>Last token loses</span>
               </button>
            </div>
          </div>
          
          <button onClick={() => startRound(true)} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fdfbf7] text-slate-800 safe-area-inset">
      <header className="flex flex-col p-4 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>
            <span className="font-bold text-slate-900 ml-2">Tokens</span>
            <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full uppercase tracking-wider font-bold">
              {rule}
            </span>
          </div>
          <button onClick={() => startRound(true)} className="p-2 text-indigo-600 bg-indigo-50 rounded-full"><RefreshCw className="w-5 h-5" /></button>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className={\`font-bold px-4 py-1.5 rounded-full \${player === 1 && phase === 'playing' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}\`}>P1's Turn</div>
          {phase === 'completed' && <div className="font-black text-slate-900 text-lg animate-in zoom-in">{getWinner()}</div>}
          <div className={\`font-bold px-4 py-1.5 rounded-full \${player === 2 && phase === 'playing' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-500 bg-slate-100'}\`}>P2's Turn</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-xl mx-auto">
        <div className="w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center mb-8 flex flex-col items-center">
          <h2 className="text-slate-500 font-bold uppercase tracking-wider mb-2">Remaining Tokens</h2>
          <div className="text-8xl font-black text-indigo-600 mb-6">{tokens}</div>
          
          {/* Visual token representation */}
          <div className="flex flex-wrap justify-center gap-2 max-w-sm">
            {Array.from({ length: Math.min(tokens, 60) }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-indigo-200 rounded-full" />
            ))}
          </div>
          <p className="mt-6 text-slate-400 font-medium h-6">{lastMove}</p>
        </div>
        
        {phase === 'playing' ? (
          <div className="w-full space-y-2">
             <h3 className="text-center font-bold text-slate-600 mb-4">Take 1, 2, or 3 tokens:</h3>
             <div className="flex gap-3">
               {[1, 2, 3].map(amt => (
                 <button
                   key={amt}
                   onClick={() => take(amt)}
                   disabled={amt > tokens}
                   className="flex-1 py-6 bg-indigo-600 text-white font-black text-2xl rounded-2xl disabled:opacity-30 disabled:bg-slate-300 active:scale-95 transition-all shadow-md flex flex-col items-center gap-1"
                 >
                   Take {amt}
                 </button>
               ))}
             </div>
          </div>
        ) : (
          <button onClick={() => startRound(false)} className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl active:scale-95 transition-transform shadow-md">
            Play Again
          </button>
        )}
      </main>
    </div>
  );
}
`);
