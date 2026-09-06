const fs = require('fs');
let file = 'src/games/WhatsMissing/index.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('<TimerSetup')) {
    c = c.replace(
        /<p className="mb-6 text-slate-600">Study the objects\. After they hide, identify what disappeared\.<\/p>/,
        '<p className="mb-6 text-slate-600">Study the objects. After they hide, identify what disappeared.</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />'
    );
}

if (!c.includes('<TimerDisplay')) {
    c = c.replace(
        /<div className="flex items-center justify-between">/,
        '<TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={phase === \'challenge\'} onTimeUp={() => { setIsTimeUp(true); setPhase(\'completed\'); }} />\n        <div className="flex items-center justify-between">'
    );
}

fs.writeFileSync(file, c);
