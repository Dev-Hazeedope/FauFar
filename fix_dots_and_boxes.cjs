const fs = require('fs');
let file = 'src/games/DotsAndBoxes/index.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
    /<p className="mb-6 text-slate-600">Connect dots to claim boxes\. Completing a box gives you another turn!<\/p>/,
    '<p className="mb-6 text-slate-600">Connect dots to claim boxes. Completing a box gives you another turn!</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />'
);

fs.writeFileSync(file, c);
