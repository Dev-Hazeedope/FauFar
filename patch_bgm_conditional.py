import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# We only want the music to play during gameplay.
# The user said "It should only play during game play"
# Currently App.tsx starts BGM on first interaction, and it stays on.
# Also the games start/stop BGM. 
# We should REMOVE the global playBGM from App.tsx 

use_effect_pattern = r"useEffect\(\(\) => \{\n\s*const handleFirstInteraction = \(\) => \{\n\s*audio\.playBGM\(\);\n\s*window\.removeEventListener\('click', handleFirstInteraction\);\n\s*window\.removeEventListener\('keydown', handleFirstInteraction\);\n\s*\};\n\n\s*window\.addEventListener\('click', handleFirstInteraction\);\n\s*window\.addEventListener\('keydown', handleFirstInteraction\);\n\n\s*return \(\) => \{\n\s*window\.removeEventListener\('click', handleFirstInteraction\);\n\s*window\.removeEventListener\('keydown', handleFirstInteraction\);\n\s*\};\n\s*\}, \[\]\);"

content = re.sub(use_effect_pattern, "", content)

# But wait, browsers block autoplay on navigation to game. 
# The game components have `useEffect` with `audio.playBGM()`. If the user clicked to enter the game, that click satisfies the interaction requirement, so `audio.playBGM()` will succeed inside the game's `useEffect`.

with open('src/App.tsx', 'w') as f:
    f.write(content)
