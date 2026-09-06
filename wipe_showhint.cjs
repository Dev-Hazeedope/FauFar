const fs = require('fs');
let file = 'src/games/NumberHunt/Gameplay.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/const showHint = \(\) => \{\n    setHintActive\(true\);\n    setTimeout\(\(\) => setHintActive\(false\), 1500\); \/\/ Brief outline\n  \};\n/g, '');
fs.writeFileSync(file, c);
