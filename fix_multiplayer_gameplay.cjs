const fs = require('fs');

let file = 'src/games/NumberHunt/multiplayer/MultiplayerGameplay.tsx';
let c = fs.readFileSync(file, 'utf8');

// Fix audio calls
c = c.replace(/audio\.play\(/g, 'audio.playCorrect('); // We'll fix error later
c = c.replace(/audio\.playCorrect\('success'\)/g, 'audio.playCorrect()');
c = c.replace(/audio\.playCorrect\('error'\)/g, 'audio.playWrong()');

// Fix generateLayout
c = c.replace(
  /setLayout\(generateLayout\(room\.config\.start, room\.config\.end\)\);/g,
  `if (boardContainerRef.current) {
        setLayout(generateLayout(room.config.start, room.config.end, boardContainerRef.current.clientWidth, boardContainerRef.current.clientHeight));
      }`
);

// Fix Board usage
c = c.replace(
  /<Board\s+layout=\{layout\}\s+foundNumbers=\{\[\]\}\s*\/\/\s*We don't hide numbers in multiplayer, we just reshuffle when found\s+onNumberClick=\{handleNumberClick\}\s*\/>/g,
  `<Board
            layout={layout}
            found={new Set()}
            currentTarget={room.currentNumber}
            onTap={handleNumberClick}
          />`
);

// Add boardContainerRef and adjust state
c = c.replace(/const \[layout, setLayout\] = useState<Layout \| null>\(null\);/g, `const [layout, setLayout] = useState<PlacedNumber[] | null>(null);\n  const boardContainerRef = React.useRef<HTMLDivElement>(null);`);

// TimerDisplay
c = c.replace(/<TimerDisplay\s+endTime=\{room\.endTime\}\s+onTimeUp=\{\(\) => \{\s+if \(isHost\) \{\s+socket\.emit\('end_game', room\.id\);\s+\}\s+\}\}\s+\/>/g, 
  `<TimerDisplay 
            timedMode={true}
            timeLeft={room.endTime ? Math.max(0, Math.floor((room.endTime - Date.now()) / 1000)) : 0}
            setTimeLeft={() => {}}
            isActive={true}
            onTimeUp={() => {
              if (isHost) {
                socket.emit('end_game', room.id);
              }
            }} 
          />`);

// Remove unused Layout import and add PlacedNumber
c = c.replace(/import \{ Layout \} from '\.\.\/types';/g, "import { PlacedNumber } from '../types';");

fs.writeFileSync(file, c);
