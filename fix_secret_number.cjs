const fs = require('fs');
let file = 'src/games/SecretNumber/index.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
    /<p className="mb-6 text-slate-600">Guess a hidden number based on higher\/lower clues\.<\/p>/,
    '<p className="mb-6 text-slate-600">Guess a hidden number based on higher/lower clues.</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />'
);

fs.writeFileSync(file, c);
