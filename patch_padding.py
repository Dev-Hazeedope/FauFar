import os
import glob

for filename in glob.glob('src/games/*/index.tsx'):
    with open(filename, 'r') as f:
        content = f.read()
    content = content.replace('w-full p-6 game-card', 'w-full p-4 sm:p-6 game-card')
    content = content.replace('game-card bg-white p-6', 'game-card bg-white p-4 sm:p-6')
    content = content.replace('flex items-center gap-6', 'flex items-center gap-4 sm:gap-6')
    with open(filename, 'w') as f:
        f.write(content)
