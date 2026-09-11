import re
import os
import glob

def patch_game_index(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Import audio engine
    if "import { audio } from" not in content:
        # Determine relative path back to root src/
        parts = file_path.split('/')
        depth = len(parts) - 2 # e.g. src/games/NumberHunt/index.tsx -> 2
        rel_path = '../' * depth + 'lib/audio'
        
        # Add import after other imports
        import_stmt = f"import {{ audio }} from '{rel_path}';\n"
        content = re.sub(r'(import .*;\n)+', lambda m: m.group(0) + import_stmt, content, count=1)

    # We need to play BGM when game mounts and stop when it unmounts
    # A generic way is to add useEffect in the main game component
    if "useEffect(() => {" not in content and "import { useEffect" not in content:
        content = content.replace("import React, { useState }", "import React, { useState, useEffect }")
        
        # Look for the main game component declaration
        comp_match = re.search(r'export function [A-Za-z]+\(.*\) \{', content)
        if comp_match:
            insert_pos = comp_match.end()
            use_effect_code = """
  useEffect(() => {
    // Start BGM when entering the game
    audio.playBGM();
    return () => {
      // Stop BGM when leaving the game
      audio.stopBGM();
    };
  }, []);
"""
            content = content[:insert_pos] + use_effect_code + content[insert_pos:]

    with open(file_path, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('src/games'):
    for file in files:
        if file == 'index.tsx':
            patch_game_index(os.path.join(root, file))

print("Patched all games to play BGM.")
