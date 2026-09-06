const fs = require('fs');
['src/games/SecretNumber/index.tsx', 'src/games/CrackTheCode/index.tsx'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/import \{ TimerSetup \} from '\.\.\/\.\.\/components\/TimerSetup';\nimport \{ TimerDisplay \} from '\.\.\/\.\.\/components\/TimerDisplay';/, '');
  fs.writeFileSync(file, c);
});
