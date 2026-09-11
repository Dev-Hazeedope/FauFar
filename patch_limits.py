import re
import os

files = [
    'src/games/NumberHunt/multiplayer/MultiplayerManager.ts',
    'src/games/SecretNumber/multiplayer/MultiplayerManager.ts'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Check if playerCount logic exists already
    if 'Object.keys(room.players).length' not in content:
        # Add player limit before name validation or adding player
        pattern = r"(const nameExists = Object.values\(room.players\).*?;)"
        replacement = r"const playerCount = Object.keys(room.players).length;\n    if (playerCount >= 50 && !room.players[clientId]) {\n      throw new Error(\"Room is full (max 50 players)\");\n    }\n\n    \1"
        content = re.sub(pattern, replacement, content)
        
        with open(file, 'w') as f:
            f.write(content)

