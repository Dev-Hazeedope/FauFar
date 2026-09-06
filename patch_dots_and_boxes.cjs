const fs = require('fs');
let file = 'src/games/DotsAndBoxes/index.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('<TimerSetup')) {
    c = c.replace(
        /<p className="mb-6 text-slate-600">Connect dots to claim boxes in this classic 2-player game\.<\/p>/,
        '<p className="mb-6 text-slate-600">Connect dots to claim boxes in this classic 2-player game.</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />'
    );
}

if (!c.includes('<TimerDisplay')) {
    c = c.replace(
        /<div className="flex items-center justify-between">/,
        '<TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === \'playing\'} onTimeUp={() => { setIsTimeUp(true); setPhase(\'completed\'); }} />\n        <div className="flex items-center justify-between">'
    );
}

fs.writeFileSync(file, c);
