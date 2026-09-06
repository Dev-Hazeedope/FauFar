const fs = require('fs');
let file = 'src/games/SecretNumber/index.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('<TimerSetup')) {
    c = c.replace(
        /<p className="mb-6 text-slate-600">Guess the hidden number based on higher\/lower clues\.<\/p>/,
        '<p className="mb-6 text-slate-600">Guess the hidden number based on higher/lower clues.</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />'
    );
}

if (!c.includes('<TimerDisplay')) {
    c = c.replace(
        /<div className="flex items-center justify-between">/,
        '<TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === \'playing\'} onTimeUp={() => { setIsTimeUp(true); setPhase(\'completed\'); }} />\n        <div className="flex items-center justify-between">'
    );
}

fs.writeFileSync(file, c);
