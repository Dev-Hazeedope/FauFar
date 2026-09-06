const fs = require('fs');
let file = 'src/games/FourInARow/index.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/type Phase = 'playing' \| 'completed';/, "type Phase = 'setup' | 'playing' | 'completed';");

c = c.replace(/const \[phase, setPhase\] = useState<Phase>\('playing'\);/, `const [phase, setPhase] = useState<Phase>('setup');
  const [timedMode, setTimedMode] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeUp, setIsTimeUp] = useState(false);`);

c = c.replace(/return \(\s*<div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-sm border border-slate-200">\s*<div className="flex items-center mb-6">/, `return (
    <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      {phase === 'setup' && (
        <div className="flex flex-col h-full">
          <div className="flex items-center mb-6">
            <button onClick={onExit} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" /></button>
            <h1 className="text-2xl font-black ml-2 text-slate-900">Four in a Row</h1>
          </div>
          <p className="mb-6 text-slate-600">Connect 4 pieces horizontally, vertically, or diagonally.</p>
          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />
          <button onClick={() => { setPhase('playing'); startRound(true); }} className="w-full mt-6 py-4 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform">
            Start Game
          </button>
        </div>
      )}
      {phase !== 'setup' && (
        <>
          <div className="flex items-center mb-6">`);

c = c.replace(/<button onClick=\{onExit\} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"><Home className="w-6 h-6" \/><\/button>/, '');
c = c.replace(/<h1 className="text-2xl font-black ml-2 text-slate-900">Four in a Row<\/h1>\s*<\/div>/, '<h2 className="text-xl font-bold text-slate-800 ml-2">Four in a Row</h2>\n</div>\n<TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === \'playing\'} onTimeUp={() => { setIsTimeUp(true); setPhase(\'completed\'); }} />');

c = c.replace(/<h2 className="text-4xl font-bold text-indigo-600 mb-4">(.*?)<\/h2>/, "<h2 className=\"text-4xl font-bold text-indigo-600 mb-4\">\n              {isTimeUp ? \"Time's Up!\" : $1}\n            </h2>");

c += "\n        </>\n      )}\n    </div>\n  );\n}\n";

c = c.replace(/<\/div>\n  \);\n}\n\n        <\/>\n      \)}\n    <\/div>\n  \);\n}\n/g, "\n        </>\n      )}\n    </div>\n  );\n}");

fs.writeFileSync(file, c);
