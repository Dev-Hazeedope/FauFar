const fs = require('fs');
function p(f, regexes) {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  for(let {from, to} of regexes) {
    if (!c.match(from)) console.log(`FAIL ${f}: ${from}`);
    c = c.replace(from, to);
  }
  fs.writeFileSync(f, c);
}

p('src/games/CrackTheCode/index.tsx', [
  { from: /import \{ Home(.*?)\} from 'lucide-react';/, to: "import { Home$1} from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';" },
  { from: /const \[phase, setPhase\] = useState<Phase>\('setup'\);/, to: "const [phase, setPhase] = useState<any>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);" },
  { from: /const startRound = \(\) => \{/, to: "const startRound = () => {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);" },
  { from: /(<h2 className="text-xl font-bold text-slate-800[^>]*>.*<\/h2>\s*<\/div>)/, to: "$1\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />" },
  { from: /(<button onClick=\{startRound\} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl active:scale-95 transition-transform">)/, to: "<TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />\n          $1" },
  { from: /<h2 className="text-4xl font-bold text-indigo-600 mb-2">(.*?)<\/h2>/, to: "<h2 className=\"text-4xl font-bold text-indigo-600 mb-2\">{isTimeUp ? \"Time's Up!\" : \"$1\"}</h2>" },
  { from: /const SYMBOLS = \[1, 2, 3, 4, 5, 6\];/, to: "const SYMBOLS = [1, 2, 3, 4, 5, 6, 7, 8];" },
  { from: /shuffle\(\[\.\.\.SYMBOLS\]\)\.slice\(0, 4\)/g, to: "shuffle([...SYMBOLS]).slice(0, 5)" },
  { from: /currentGuess\.length >= 4/g, to: "currentGuess.length >= 5" },
  { from: /currentGuess\.length !== 4/g, to: "currentGuess.length !== 5" },
  { from: /rightPlace === 4/g, to: "rightPlace === 5" },
  { from: /4 distinct numbers \(1-6\)/, to: "5 distinct numbers (1-8)" },
  { from: /\{\[0, 1, 2, 3\]\.map/g, to: "{[0, 1, 2, 3, 4].map" }
]);

p('src/games/SecretNumber/index.tsx', [
  { from: /import \{ Home(.*?)\} from 'lucide-react';/, to: "import { Home$1} from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';" },
  { from: /const \[phase, setPhase\] = useState<.*?>\('setup'\);/, to: "const [phase, setPhase] = useState<any>('setup');\n  const [timedMode, setTimedMode] = useState(false);\n  const [timeLimit, setTimeLimit] = useState(60);\n  const [timeLeft, setTimeLeft] = useState(60);\n  const [isTimeUp, setIsTimeUp] = useState(false);" },
  { from: /const startRound = \((.*?)\) => \{/, to: "const startRound = ($1) => {\n    setTimeLeft(timeLimit);\n    setIsTimeUp(false);" },
  { from: /(<h2 className="text-xl font-bold text-slate-800[^>]*>.*<\/h2>\s*<\/div>)/, to: "$1\n        <TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === 'playing'} onTimeUp={() => { setIsTimeUp(true); setPhase('completed'); }} />" },
  { from: /(<div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-200">\s*<div>)/, to: "<TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />\n        $1" },
  { from: /<h2 className="text-4xl font-bold text-indigo-600 mb-4">(.*?)<\/h2>/, to: "<h2 className=\"text-4xl font-bold text-indigo-600 mb-4\">{isTimeUp ? \"Time's Up!\" : \"$1\"}</h2>" },
  { from: /const \[max, setMax\] = useState\('100'\);/, to: "const [max, setMax] = useState('1000');" }
]);
