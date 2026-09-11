import re
import os

files = [
    'src/index.css',
    'src/App.tsx',
    'src/games/NumberHunt/Board.tsx',
    'src/games/NumberHunt/Gameplay.tsx',
    'src/components/HowToPlayModal.tsx',
    'index.html'
]

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace Fredoka imports in css
        content = content.replace("family=Fredoka:wght@400;600;700", "family=Outfit:wght@400;600;700;800;900")
        
        # Replace font-family CSS
        content = content.replace("font-family: 'Fredoka', sans-serif;", "font-family: 'Outfit', sans-serif;")
        
        # Replace class names
        content = content.replace("font-fredoka", "font-outfit")
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
