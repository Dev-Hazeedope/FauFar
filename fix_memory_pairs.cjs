const fs = require('fs');

let file = 'src/games/MemoryPairs/index.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/type Difficulty = 10 \| 15 \| 20;/g, "type Difficulty = 6 | 8 | 12;");

fs.writeFileSync(file, c);
