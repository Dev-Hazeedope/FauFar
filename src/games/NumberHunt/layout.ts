import { randomInt } from '../../lib/utils';
import { PlacedNumber } from './types';

export function measureNumber(num: number, scale: number, minSize: number = 44): { width: number; height: number; fontSize: number } {
  const str = num.toString();
  // Base font size is 24px, we scale it for difficulty
  const fontSize = 24 * scale;
  return {
    width: Math.max(minSize, (24 + str.length * 14) * scale),
    height: Math.max(minSize, 44 * scale),
    fontSize,
  };
}

function rectIntersect(r1: PlacedNumber, r2: PlacedNumber, pad: number): boolean {
  return !(
    r2.x >= r1.x + r1.width + pad ||
    r2.x + r2.width + pad <= r1.x ||
    r2.y >= r1.y + r1.height + pad ||
    r2.y + r2.height + pad <= r1.y
  );
}

function attemptLayout(
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
  const safeMargin = 2;
  const colors = ['#FF5757', '#5CE1E6', '#9ddb4e', '#0f172a', '#e8c946', '#FF914D'];

  for (let i = start; i <= end; i++) {
    const scale = scaleMin + Math.random() * (scaleMax - scaleMin);
    const { width, height, fontSize } = measureNumber(i, scale, minSize);
    const colorClass = colors[randomInt(0, colors.length - 1)];
    let placed = false;

    const maxX = Math.max(0, containerWidth - width - safeMargin);
    const maxY = Math.max(0, containerHeight - height - safeMargin);
    
    if (maxX <= 0 || maxY <= 0) return null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = randomInt(safeMargin, maxX);
      const y = randomInt(safeMargin, maxY);
      const rotation = randomInt(-35, 35);

      const candidate: PlacedNumber = { value: i, x, y, rotation, width, height, fontSize, colorClass };

      let collision = false;
      for (const item of items) {
        if (rectIntersect(candidate, item, pad)) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        items.push(candidate);
        placed = true;
        break;
      }
    }

    if (!placed) {
      return null;
    }
  }

  return items;
}

function gridFallback(
  start: number,
  end: number,
  containerWidth: number,
  containerHeight: number
): PlacedNumber[] | null {
  const items: PlacedNumber[] = [];
  const count = end - start + 1;
  const colors = ['#FF5757', '#5CE1E6', '#9ddb4e', '#0f172a', '#e8c946', '#FF914D'];
  
  // Calculate grid dimensions
  const aspect = containerWidth / containerHeight;
  const cols = Math.ceil(Math.sqrt(count * aspect));
  const rows = Math.ceil(count / cols);
  
  const cellW = containerWidth / cols;
  const cellH = containerHeight / rows;
  
  // Need at least 20px cell size to be vaguely readable
  if (cellW < 20 || cellH < 20) return null;

  // Use a fixed small scale that guarantees fitting in the cell
  const scale = Math.min(cellW / 44, cellH / 44) * 0.9;
  
  const gridPositions: {r: number, c: number}[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gridPositions.push({r, c});
    }
  }
  
  // Shuffle positions to keep the organic feel even in a grid
  const shuffledPositions = [...gridPositions].sort(() => Math.random() - 0.5);

  let posIdx = 0;
  for (let i = start; i <= end; i++) {
    const pos = shuffledPositions[posIdx++];
    const { width, height, fontSize } = measureNumber(i, scale, 24);
    const colorClass = colors[randomInt(0, colors.length - 1)];
    
    // Add some random jitter inside the cell
    const maxJitterX = Math.max(0, cellW - width);
    const maxJitterY = Math.max(0, cellH - height);
    
    const x = pos.c * cellW + Math.random() * maxJitterX;
    const y = pos.r * cellH + Math.random() * maxJitterY;
    const rotation = randomInt(-20, 20);

    items.push({ value: i, x, y, rotation, width, height, fontSize, colorClass });
  }

  return items;
}

export function generateLayout(
  start: number,
  end: number,
  containerWidth: number,
  containerHeight: number
): PlacedNumber[] | null {
  // Pass 1: High difficulty, varied scales, generous padding
  let layout = attemptLayout(start, end, containerWidth, containerHeight, 0.7, 1.6, 6, 2000, 44);
  if (layout) return layout;

  // Pass 2: Medium difficulty, tighter packing
  layout = attemptLayout(start, end, containerWidth, containerHeight, 0.6, 1.0, 2, 3000, 44);
  if (layout) return layout;

  // Pass 3: Low difficulty (minimum scales to fit the 44px touch target), zero padding
  layout = attemptLayout(start, end, containerWidth, containerHeight, 0.5, 0.6, 0, 5000, 44);
  if (layout) return layout;

  // Pass 4: Ultra dense mode. Shrinks the minimum target size slightly (violates 44px, but needed for 200 on mobile)
  layout = attemptLayout(start, end, containerWidth, containerHeight, 0.45, 0.5, -2, 8000, 32);
  if (layout) return layout;

  // Pass 5: Bounded packing grid fallback (allows extremely dense layouts)
  return gridFallback(start, end, containerWidth, containerHeight);
}
