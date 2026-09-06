const fs = require('fs');
let file = 'src/games/MemoryPairs/index.tsx';
let c = fs.readFileSync(file, 'utf8');

if (!c.includes('TimerSetup')) {
    c = c.replace(/import \{ Home, RefreshCw, Trophy, User, Users \} from 'lucide-react';/, 
        "import { Home, RefreshCw, Trophy, User, Users } from 'lucide-react';\nimport { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';"
    );
    
    c = c.replace(
        /<p className="mb-6 text-slate-600">Find matching pairs\. Leave non-matches visible until you're ready\.<\/p>/,
        '<p className="mb-6 text-slate-600">Find matching pairs. Leave non-matches visible until you\'re ready.</p>\n          <TimerSetup timedMode={timedMode} setTimedMode={setTimedMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} />'
    );
    
    c = c.replace(
        /<div className="flex items-center justify-between">/,
        '<TimerDisplay timedMode={timedMode} timeLeft={timeLeft} setTimeLeft={setTimeLeft} isActive={state === \'playing\'} onTimeUp={() => { setIsTimeUp(true); setState(\'completed\'); }} />\n        <div className="flex items-center justify-between">'
    );
}

fs.writeFileSync(file, c);
