import re

with open('src/games/NumberHunt/multiplayer/MultiplayerGameplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"const { width: w, height: h } = entry.contentRect;[\s]*if \(w > 100 && h > 100 && !currentLayoutGenerated\) \{[\s]*setLayout\(generateLayout\(room.config.start, room.config.end, w, h\)\);",
    r"""const { width: w, height: h } = entry.contentRect;
      // Subtract 8px for the border-4 on the Board component
      const innerW = w - 8;
      const innerH = h - 8;
      
      if (innerW > 100 && innerH > 100 && !currentLayoutGenerated) {
        setLayout(generateLayout(room.config.start, room.config.end, innerW, innerH));""",
    content
)

with open('src/games/NumberHunt/multiplayer/MultiplayerGameplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
