const fs = require('fs');

// NumberHunt Board
let file = 'src/games/NumberHunt/Board.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/const isHinted = false;\n/g, '');
c = c.replace(/isHinted && !isFound && "ring-4 ring-indigo-400 bg-indigo-50"/g, '');
fs.writeFileSync(file, c);

// NumberHunt Gameplay
file = 'src/games/NumberHunt/Gameplay.tsx';
c = fs.readFileSync(file, 'utf8');
c = c.replace(/setHintActive\(false\);\n/g, '');
c = c.replace(/const showHint = \(\) => \{\n\s*setHintActive\(true\);\n\s*setTimeout\(\(\) => setHintActive\(false\), 1500\);\n\s*\};\n/g, '');
c = c.replace(/<button[^>]*onClick=\{showHint\}[^>]*>[\s\S]*?<\/button>\n/g, '');
fs.writeFileSync(file, c);

// FindTheTwins
file = 'src/games/FindTheTwins/index.tsx';
c = fs.readFileSync(file, 'utf8');
c = c.replace(/setHintActive\(false\);\n/g, '');
c = c.replace(/<button onClick=\{\(\) => setHintActive\(true\)\}.*?<\/button>\n/g, '');
c = c.replace(/\/\/ Hint highlights ONE of the twins \(we pick the first one that is a pair\)\n\s*const isHinted = false;\n/g, '');
c = c.replace(/:\s*isHinted\s*\?\s*'ring-4 ring-amber-400 bg-white text-slate-700'/g, '');
fs.writeFileSync(file, c);

