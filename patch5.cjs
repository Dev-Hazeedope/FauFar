const fs = require('fs');
let file = 'src/games/TakeTheLastToken/index.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/<button onClick=\{\(\) => setInitialCount\('35'\)\} className=\{`flex-1 py-2 rounded-lg font-bold \$\{initialCount === '35' \? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'\}`\}>35<\/button>\s*<button onClick=\{\(\) => setInitialCount\('35'\)\} className=\{`flex-1 py-2 rounded-lg font-bold \$\{initialCount === '35' \? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'\}`\}>35<\/button>/, "<button onClick={() => setInitialCount('21')} className={`flex-1 py-2 rounded-lg font-bold ${initialCount === '21' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>21</button>\n               <button onClick={() => setInitialCount('35')} className={`flex-1 py-2 rounded-lg font-bold ${initialCount === '35' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>35</button>");

c = c.replace(/max="60"/g, 'max="100"');
c = c.replace(/count > 60/, 'count > 100');

fs.writeFileSync(file, c);
