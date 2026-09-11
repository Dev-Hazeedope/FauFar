import re

with open('src/games/NumberHunt/Gameplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix ResizeObserver size subtraction for border
content = re.sub(
    r"const { width: w, height: h } = entry.contentRect;[\s]*if \(w > 100 && h > 100\) \{[\s]*if \(!initialized\) \{[\s]*baseSize.current = \{ w, h \};[\s]*initBoard\(w, h\);",
    r"""const { width: w, height: h } = entry.contentRect;
      // Subtract 8px for the border-4 on the Board component
      const innerW = w - 8;
      const innerH = h - 8;
      
      if (innerW > 100 && innerH > 100) {
        if (!initialized) {
          baseSize.current = { w: innerW, h: innerH };
          initBoard(innerW, innerH);""",
    content
)

# Fix ResizeObserver size subtraction for handleRestart
content = re.sub(
    r"const handleRestart = \(\) => \{[\s]*if \(!boardContainerRef.current\) return;[\s]*const w = boardContainerRef.current.clientWidth;[\s]*const h = boardContainerRef.current.clientHeight;[\s]*baseSize.current = \{ w, h \};[\s]*initBoard\(w, h\);",
    r"""const handleRestart = () => {
    if (!boardContainerRef.current) return;
    // clientWidth includes padding. We want the content box, so we subtract padding.
    // However, it's safer to just use the baseSize we already stored, or recalculate carefully.
    // Since we know baseSize has the correct content dimensions from ResizeObserver:
    if (baseSize.current) {
      initBoard(baseSize.current.w, baseSize.current.h);
    }
  """,
    content
)

with open('src/games/NumberHunt/Gameplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

