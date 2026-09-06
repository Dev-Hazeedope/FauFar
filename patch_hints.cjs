const fs = require('fs');

// NumberHunt Board
let file = 'src/games/NumberHunt/Board.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/\s*hintActive: boolean;/g, '');
c = c.replace(/export function Board\(\{ layout, found, hintActive, currentTarget, onTap \}: Props\) \{/g, 'export function Board({ layout, found, currentTarget, onTap }: Props) {');
c = c.replace(/const isHinted = hintActive && item\.value === currentTarget;/g, 'const isHinted = false;');
fs.writeFileSync(file, c);

// NumberHunt Gameplay
file = 'src/games/NumberHunt/Gameplay.tsx';
c = fs.readFileSync(file, 'utf8');
c = c.replace(/\s*const \[hintActive, setHintActive\] = useState\(false\);/g, '');
c = c.replace(/\s*hintActive=\{hintActive\}/g, '');
c = c.replace(/disabled=\{hintActive \|\| layoutError \|\| resizeError\}/g, 'disabled={layoutError || resizeError}');
// Remove hint button from Gameplay.tsx
c = c.replace(/<button[^>]*setHintActive[^>]*>[\s\S]*?<\/button>/g, '');
fs.writeFileSync(file, c);

// FindTheTwins
file = 'src/games/FindTheTwins/index.tsx';
c = fs.readFileSync(file, 'utf8');
c = c.replace(/\s*const \[hintActive, setHintActive\] = useState\(false\);/g, '');
c = c.replace(/<button[^>]*setHintActive[^>]*>[\s\S]*?<\/button>/g, '');
c = c.replace(/const isHinted = hintActive && item\.id === firstPairId && !foundIds\.includes\(item\.id\);/g, 'const isHinted = false;');
fs.writeFileSync(file, c);

