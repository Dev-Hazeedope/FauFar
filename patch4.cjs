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

p('src/games/DotsAndBoxes/index.tsx', [
  { from: /type BoardSize = 3 \| 4 \| 5;/, to: "type BoardSize = 4 | 6 | 8;" },
  { from: /const \[size, setSize\] = useState<BoardSize>\(4\);/, to: "const [size, setSize] = useState<BoardSize>(6);" },
  { from: /\{\[3, 4, 5\]\.map/, to: "{[4, 6, 8].map" }
]);

p('src/games/FourInARow/index.tsx', [
  { from: /const COLS = 7;/, to: "const COLS = 9;" },
  { from: /const ROWS = 6;/, to: "const ROWS = 7;" }
]);

p('src/games/TakeTheLastToken/index.tsx', [
  { from: /const \[initialCount, setInitialCount\] = useState\('15'\);/, to: "const [initialCount, setInitialCount] = useState('21');" },
  { from: /<button onClick=\{\(\) => setInitialCount\('15'\)\} className=\{`flex-1 py-2 rounded-lg font-bold \$\{initialCount === '15' \? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'\}`\}>15<\/button>/, to: "<button onClick={() => setInitialCount('21')} className={`flex-1 py-2 rounded-lg font-bold ${initialCount === '21' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>21</button>" },
  { from: /<button onClick=\{\(\) => setInitialCount\('21'\)\} className=\{`flex-1 py-2 rounded-lg font-bold \$\{initialCount === '21' \? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'\}`\}>21<\/button>/, to: "<button onClick={() => setInitialCount('35')} className={`flex-1 py-2 rounded-lg font-bold ${initialCount === '35' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>35</button>" },
  { from: /<button onClick=\{\(\) => setInitialCount\('30'\)\} className=\{`flex-1 py-2 rounded-lg font-bold \$\{initialCount === '30' \? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'\}`\}>30<\/button>/, to: "<button onClick={() => setInitialCount('50')} className={`flex-1 py-2 rounded-lg font-bold ${initialCount === '50' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>50</button>" }
]);
