const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');
c = c.replace(/const PORT = process\.env\.PORT \|\| 3000;/g, 'const PORT = 3000;');
fs.writeFileSync('server.ts', c);
