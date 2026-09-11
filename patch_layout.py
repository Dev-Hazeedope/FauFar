import re

with open('src/games/NumberHunt/layout.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add safeMargin parameter to attemptLayout
old_sig = """function attemptLayout(
  start: number,
  end: number,
  containerWidth: number,
  containerHeight: number,
  scaleMin: number,
  scaleMax: number,
  pad: number,
  maxAttempts: number,
  minSize: number = 44
): PlacedNumber[] | null {
  const items: PlacedNumber[] = [];
  const safeMargin = 2;"""

new_sig = """function attemptLayout(
  start: number,
  end: number,
  containerWidth: number,
  containerHeight: number,
  scaleMin: number,
  scaleMax: number,
  pad: number,
  maxAttempts: number,
  minSize: number = 44,
  safeMargin: number = 16
): PlacedNumber[] | null {
  const items: PlacedNumber[] = [];"""

content = content.replace(old_sig, new_sig)

with open('src/games/NumberHunt/layout.ts', 'w', encoding='utf-8') as f:
    f.write(content)

