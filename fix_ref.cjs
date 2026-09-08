const fs = require('fs');

let file = 'src/games/NumberHunt/multiplayer/MultiplayerGameplay.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/<div className="flex-1 relative overflow-hidden bg-\[\#fdfbf7\] p-2">/g, 
  `<div ref={boardContainerRef} className="flex-1 relative overflow-hidden bg-[#fdfbf7] p-2">`);

fs.writeFileSync(file, c);
