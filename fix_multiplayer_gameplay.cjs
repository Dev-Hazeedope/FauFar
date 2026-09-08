const fs = require('fs');

let file = 'src/games/NumberHunt/multiplayer/MultiplayerGameplay.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const isPlaying = room\.state === 'playing' \|\| room\.state === 'completed';/, 
  `const isPlaying = room.state === 'playing' || room.state === 'completed';
  const [localTimeLeft, setLocalTimeLeft] = useState(room.endTime ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)) : 0);
  
  useEffect(() => {
    if (room.endTime) {
      setLocalTimeLeft(Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)));
    }
  }, [room.endTime]);`);

c = c.replace(/<TimerDisplay \s*timedMode=\{true\}\s*timeLeft=\{room\.endTime \? Math\.max\(0, Math\.floor\(\(room\.endTime - Date\.now\(\)\) \/ 1000\)\) : 0\}\s*setTimeLeft=\{\(fn\) => \{\s*\/\/.*?\s*\/\/.*?\s*\/\/.*?\s*\}\}\s*isActive=\{room\.state === 'playing'\}/s, 
  `<TimerDisplay 
            timedMode={true}
            timeLeft={localTimeLeft}
            setTimeLeft={setLocalTimeLeft}
            isActive={room.state === 'playing'}`);

fs.writeFileSync(file, c);
