const fs = require('fs');

let file = 'src/games/NumberHunt/Gameplay.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/const showHint = \(\) => \{\s*setHintActive\(true\);\s*setTimeout\(\(\) => setHintActive\(false\), 1500\);\s*\};\s*/g, '');
c = c.replace(/<button\s*onClick=\{showHint\}\s*className="flex flex-col items-center justify-center p-2 text-indigo-600 bg-indigo-50 rounded-xl active:scale-95 transition-transform"\s*>\s*<Lightbulb className="w-6 h-6 mb-1" \/>\s*<span className="text-xs font-semibold">Hint<\/span>\s*<\/button>/g, '');
fs.writeFileSync(file, c);

file = 'src/games/FindTheTwins/index.tsx';
c = fs.readFileSync(file, 'utf8');
c = c.replace(/\s*\/\/ Hint highlights ONE of the twins[\s\S]*?const isHinted = false;/g, '');
fs.writeFileSync(file, c);
