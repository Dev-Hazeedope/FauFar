const fs = require('fs');

['src/games/FindTheTwins/index.tsx', 'src/games/MemoryPairs/index.tsx'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  if (!c.includes("import { TimerSetup }")) {
    c = "import { TimerSetup } from '../../components/TimerSetup';\nimport { TimerDisplay } from '../../components/TimerDisplay';\n" + c;
    fs.writeFileSync(file, c);
  }
});
