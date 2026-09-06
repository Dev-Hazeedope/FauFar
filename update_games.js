const fs = require('fs');

function p(file, patches) {
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

// 1. OddOneOut
p('src/games/OddOneOut/index.tsx', [
  { from: `import { Home, Lightbulb, RefreshCw } from 'lucide-react';`, 
    to: `import { Home, Lightbulb, RefreshCw } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';` },
  { from: `const COUNTS = { easy: 12, medium: 24, hard: 40 };`, 
    to: `const COUNTS = { easy: 24, medium: 40, hard: 60 };` },
  { from: `const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');`, 
    to: `const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);` },
  { from: `function startRound(level: Difficulty) {`, 
    to: `function startRound(level: Difficulty) {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);` },
  { from: `          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">\n            <Home className="w-6 h-6" />\n          </button>\n          <h2 className="text-xl font-bold text-slate-800">Odd One Out</h2>\n        </div>`,
    to: `          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">\n            <Home className="w-6 h-6" />\n          </button>\n          <h2 className="text-xl font-bold text-slate-800">Odd One Out</h2>\n        </div>\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={state === 'playing'} onTimeUp={() => { setIsTimeUp(true); setState('completed'); }} />` },
  { from: `        <p className="text-slate-500 mb-8">Find the one item that is different from all the others.</p>`,
    to: `        <p className="text-slate-500 mb-8">Find the one item that is different from all the others.</p>\n        <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />` },
  { from: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">Great Job!</h2>\n            <p className="text-slate-600 mb-8 text-lg">You found the odd one out.</p>`, 
    to: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">{isTimeUp ? "Time's Up!" : "Great Job!"}</h2>\n            <p className="text-slate-600 mb-8 text-lg">{isTimeUp ? "You didn't find the odd one out in time." : "You found the odd one out."}</p>` }
]);

// 2. FindTheTwins
p('src/games/FindTheTwins/index.tsx', [
  { from: `import { Home, RefreshCw } from 'lucide-react';`, 
    to: `import { Home, RefreshCw } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';` },
  { from: `const COUNTS = { easy: 12, medium: 20, hard: 30 };`, 
    to: `const COUNTS = { easy: 20, medium: 30, hard: 40 };` },
  { from: `const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');`, 
    to: `const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);` },
  { from: `function startRound(level: Difficulty) {`, 
    to: `function startRound(level: Difficulty) {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);` },
  { from: `          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">\n            <Home className="w-6 h-6" />\n          </button>\n          <h2 className="text-xl font-bold text-slate-800">Find the Twins</h2>\n        </div>`,
    to: `          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">\n            <Home className="w-6 h-6" />\n          </button>\n          <h2 className="text-xl font-bold text-slate-800">Find the Twins</h2>\n        </div>\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={state === 'playing'} onTimeUp={() => { setIsTimeUp(true); setState('completed'); }} />` },
  { from: `        <p className="text-slate-500 mb-8">Exactly two symbols on the board are identical. Find them.</p>`,
    to: `        <p className="text-slate-500 mb-8">Exactly two symbols on the board are identical. Find them.</p>\n        <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />` },
  { from: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">You found them!</h2>\n            <p className="text-slate-600 mb-8 text-lg">Great eye for detail.</p>`, 
    to: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">{isTimeUp ? "Time's Up!" : "You found them!"}</h2>\n            <p className="text-slate-600 mb-8 text-lg">{isTimeUp ? "You didn't find the twins in time." : "Great eye for detail."}</p>` }
]);

// 3. MemoryPairs
p('src/games/MemoryPairs/index.tsx', [
  { from: `import { Home, Users, User } from 'lucide-react';`, 
    to: `import { Home, Users, User } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';` },
  { from: `type Difficulty = 6 | 8 | 12;`, 
    to: `type Difficulty = 10 | 15 | 20;` },
  { from: `{[6, 8, 12].map((d) => (`, 
    to: `{[10, 15, 20].map((d) => (` },
  { from: `const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');`, 
    to: `const [state, setState] = useState<'setup' | 'playing' | 'completed'>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);` },
  { from: `function startRound(pairs: Difficulty) {`, 
    to: `function startRound(pairs: Difficulty) {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);` },
  { from: `          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">\n            <Home className="w-6 h-6" />\n          </button>\n          <h2 className="text-xl font-bold text-slate-800">Memory Pairs</h2>\n        </div>`,
    to: `          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">\n            <Home className="w-6 h-6" />\n          </button>\n          <h2 className="text-xl font-bold text-slate-800">Memory Pairs</h2>\n        </div>\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={state === 'playing'} onTimeUp={() => { setIsTimeUp(true); setState('completed'); }} />` },
  { from: `        <div className="flex justify-center gap-4 mb-8">`,
    to: `        <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />\n        <div className="flex justify-center gap-4 mb-8">` },
  { from: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">\n              {winner ? \`Player \${winner} Wins!\` : players === 1 ? 'Well Done!' : 'It\\'s a Tie!'}\n            </h2>`, 
    to: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">\n              {isTimeUp ? "Time's Up!" : winner ? \`Player \${winner} Wins!\` : players === 1 ? 'Well Done!' : 'It\\'s a Tie!'}\n            </h2>` }
]);

