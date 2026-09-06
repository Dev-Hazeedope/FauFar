const fs = require('fs');
let file = 'src/games/registry.ts';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/import { OddOneOut } from '\.\/OddOneOut';/, '');
c = c.replace(/,\s*\{\s*id:\s*'odd-one-out'[\s\S]*?component:\s*OddOneOut,\s*\}/, '');
fs.writeFileSync(file, c);
