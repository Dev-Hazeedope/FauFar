const fs = require('fs');

function p(file, patches) {
  if (!fs.existsSync(file)) {
    console.log(`Skipping ${file}`);
    return;
  }
  let c = fs.readFileSync(file, 'utf8');
  for (const { from, to } of patches) {
    if (!c.includes(from)) {
      console.log(`FAIL ${file}: \n---\n${from}\n---`);
    } else {
      c = c.replace(from, to);
    }
  }
  fs.writeFileSync(file, c);
}

// 7. DotsAndBoxes
p('src/games/DotsAndBoxes/index.tsx', [
  { from: `import { Home, RefreshCw, User, Users } from 'lucide-react';`, 
    to: `import { Home, RefreshCw, User, Users } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';` },
  { from: `type BoardSize = 3 | 4 | 5;`, 
    to: `type BoardSize = 4 | 6 | 8;` },
  { from: `  const [size, setSize] = useState<BoardSize>(4);`, 
    to: `  const [size, setSize] = useState<BoardSize>(6);` },
  { from: `{[3, 4, 5].map(s => {`, 
    to: `{[4, 6, 8].map(s => {` },
  { from: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');`, 
    to: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);` },
  { from: `  const startRound = (sz: BoardSize, keepStarter = true) => {`, 
    to: `  const startRound = (sz: BoardSize, keepStarter = true) => {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);` },
  { from: `          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>\n          <h2 className="text-xl font-bold text-slate-800 ml-2">Dots & Boxes</h2>\n        </div>`,
    to: `          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>\n          <h2 className="text-xl font-bold text-slate-800 ml-2">Dots & Boxes</h2>\n        </div>\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />` },
  { from: `          <p className="mb-6 text-slate-600">Connect the dots to form boxes.</p>`, 
    to: `          <p className="mb-6 text-slate-600">Connect the dots to form boxes.</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />` },
  { from: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">\n              {score[1] === score[2] ? "It's a Tie!" : \`Player \${score[1] > score[2] ? 1 : 2} Wins!\`}\n            </h2>`, 
    to: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">\n              {isTimeUp ? "Time's Up!" : score[1] === score[2] ? "It's a Tie!" : \`Player \${score[1] > score[2] ? 1 : 2} Wins!\`}\n            </h2>` }
]);

// 8. FourInARow
p('src/games/FourInARow/index.tsx', [
  { from: `import { Home, RefreshCw, User, Users } from 'lucide-react';`, 
    to: `import { Home, RefreshCw, User, Users } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';` },
  { from: `const COLS = 7;`, 
    to: `const COLS = 9;` },
  { from: `const ROWS = 6;`, 
    to: `const ROWS = 7;` },
  { from: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');`, 
    to: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);` },
  { from: `  const startRound = (keepStarter = true) => {`, 
    to: `  const startRound = (keepStarter = true) => {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);` },
  { from: `          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>\n          <h2 className="text-xl font-bold text-slate-800 ml-2">Four in a Row</h2>\n        </div>`,
    to: `          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>\n          <h2 className="text-xl font-bold text-slate-800 ml-2">Four in a Row</h2>\n        </div>\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />` },
  { from: `          <p className="mb-8 text-slate-600">Connect 4 pieces horizontally, vertically, or diagonally.</p>`, 
    to: `          <p className="mb-8 text-slate-600">Connect 4 pieces horizontally, vertically, or diagonally.</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />` },
  { from: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">\n              {winner ? \`Player \${winner} Wins!\` : "It's a Draw!"}\n            </h2>`, 
    to: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">\n              {isTimeUp ? "Time's Up!" : winner ? \`Player \${winner} Wins!\` : "It's a Draw!"}\n            </h2>` }
]);

// 9. TakeTheLastToken
p('src/games/TakeTheLastToken/index.tsx', [
  { from: `import { Home, RefreshCw, User, Users } from 'lucide-react';`, 
    to: `import { Home, RefreshCw, User, Users } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';` },
  { from: `               <button onClick={() => setInitialCount('15')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '15' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>15</button>`, 
    to: `               <button onClick={() => setInitialCount('21')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '21' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>21</button>` },
  { from: `               <button onClick={() => setInitialCount('21')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '21' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>21</button>`, 
    to: `               <button onClick={() => setInitialCount('35')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '35' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>35</button>` },
  { from: `               <button onClick={() => setInitialCount('30')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '30' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>30</button>`, 
    to: `               <button onClick={() => setInitialCount('50')} className={\`flex-1 py-2 rounded-lg font-bold \${initialCount === '50' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}\`}>50</button>` },
  { from: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');`, 
    to: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);` },
  { from: `  const startRound = (keepStarter = true) => {`, 
    to: `  const startRound = (keepStarter = true) => {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);` },
  { from: `          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>\n          <h2 className="text-xl font-bold text-slate-800 ml-2">Take the Last Token</h2>\n        </div>`,
    to: `          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>\n          <h2 className="text-xl font-bold text-slate-800 ml-2">Take the Last Token</h2>\n        </div>\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />` },
  { from: `            <div className="mb-6">\n              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Tokens</label>`, 
    to: `            <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />\n            <div className="mb-6">\n              <label className="block text-sm font-semibold text-slate-700 mb-2">Total Tokens</label>` },
  { from: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">\n              Player {winner} Wins!\n            </h2>`, 
    to: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">\n              {isTimeUp ? "Time's Up!" : \`Player \${winner} Wins!\`}\n            </h2>` },
  { from: `const [initialCount, setInitialCount] = useState('15');`,
    to: `const [initialCount, setInitialCount] = useState('21');` }
]);

