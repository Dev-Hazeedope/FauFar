const fs = require('fs');
let file = 'src/games/CrackTheCode/index.tsx';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/<\/ul>\n          <TimerSetup timedMode=\{timedMode\} setTimedMode=\{setTimedMode\} timeLimit=\{timeLimit\} setTimeLimit=\{setTimeLimit\} \/>/, '</ul>');
fs.writeFileSync(file, c);
