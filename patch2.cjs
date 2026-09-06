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

// 5. SecretNumber
p('src/games/SecretNumber/index.tsx', [
  { from: `import { Home, RefreshCw, User, Cpu, ArrowUp, ArrowDown, Check } from 'lucide-react';`, 
    to: `import { Home, RefreshCw, User, Cpu, ArrowUp, ArrowDown, Check } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';` },
  { from: `const [max, setMax] = useState('100');`, 
    to: `const [max, setMax] = useState('1000');` },
  { from: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');`, 
    to: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);` },
  { from: `  const startRound = (mode: 'solo' | 'versus') => {`, 
    to: `  const startRound = (mode: 'solo' | 'versus') => {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);` },
  { from: `          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>\n          <h2 className="text-xl font-bold text-slate-800 ml-2">Secret Number</h2>\n        </div>`,
    to: `          <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>\n          <h2 className="text-xl font-bold text-slate-800 ml-2">Secret Number</h2>\n        </div>\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />` },
  { from: `            <div>\n              <label className="block text-sm font-semibold text-slate-700 mb-2">Max (1-9999)</label>\n              <input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500" />\n            </div>`,
    to: `            <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />\n            <div>\n              <label className="block text-sm font-semibold text-slate-700 mb-2">Max (1-9999)</label>\n              <input type="number" value={max} onChange={e => setMax(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500" />\n            </div>` },
  { from: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">You Got It!</h2>`, 
    to: `            <h2 className="text-4xl font-bold text-indigo-600 mb-4">{isTimeUp ? "Time's Up!" : "You Got It!"}</h2>` }
]);

// 6. CrackTheCode
p('src/games/CrackTheCode/index.tsx', [
  { from: `import { Home, RefreshCw, X, Delete } from 'lucide-react';`, 
    to: `import { Home, RefreshCw, X, Delete } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';` },
  { from: `const SYMBOLS = [1, 2, 3, 4, 5, 6];`, 
    to: `const SYMBOLS = [1, 2, 3, 4, 5, 6, 7, 8];` },
  { from: `    const s = shuffle([...SYMBOLS]).slice(0, 4);`, 
    to: `    const s = shuffle([...SYMBOLS]).slice(0, 5);` },
  { from: `    if (currentGuess.length >= 4) return;`, 
    to: `    if (currentGuess.length >= 5) return;` },
  { from: `    if (currentGuess.length !== 4) return;`, 
    to: `    if (currentGuess.length !== 5) return;` },
  { from: `    if (rightPlace === 4) {`, 
    to: `    if (rightPlace === 5) {` },
  { from: `          <p className="mb-4 text-slate-600">The app hides 4 distinct numbers (1-6) in a secret order. No repeats allowed.</p>`, 
    to: `          <p className="mb-4 text-slate-600">The app hides 5 distinct numbers (1-8) in a secret order. No repeats allowed.</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />` },
  { from: `                  {[0, 1, 2, 3].map(idx => (`, 
    to: `                  {[0, 1, 2, 3, 4].map(idx => (` },
  { from: `                    disabled={currentGuess.includes(sym) || currentGuess.length >= 4}`, 
    to: `                    disabled={currentGuess.includes(sym) || currentGuess.length >= 5}` },
  { from: `                disabled={currentGuess.length !== 4}`, 
    to: `                disabled={currentGuess.length !== 5}` },
  { from: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');`, 
    to: `const [phase, setPhase] = useState<'setup' | 'playing' | 'completed'>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);` },
  { from: `  const startRound = () => {`, 
    to: `  const startRound = () => {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);` },
  { from: `          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>\n          <h2 className="text-xl font-bold text-slate-800">Crack the Code</h2>\n        </div>`,
    to: `          <button onClick={onExit} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"><Home className="w-5 h-5" /></button>\n          <h2 className="text-xl font-bold text-slate-800">Crack the Code</h2>\n        </div>\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />` },
  { from: `            <h2 className="text-4xl font-bold text-indigo-600 mb-2">Code Cracked!</h2>`, 
    to: `            <h2 className="text-4xl font-bold text-indigo-600 mb-2">{isTimeUp ? "Time's Up!" : "Code Cracked!"}</h2>` }
]);

