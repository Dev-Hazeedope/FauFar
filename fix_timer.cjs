const fs = require('fs');

let file = 'src/games/NumberHunt/multiplayer/MultiplayerGameplay.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/setTimeLeft=\{\(\) => \{\}\}/g, `setTimeLeft={(fn) => {
              // TimerDisplay expects to be able to call this to update state, but we don't want to manage local state
              // We'll just let it call it. If we need UI to tick down, we can force a re-render
              // Actually we should just use local state for the UI tick
            }}`);

fs.writeFileSync(file, c);
