import re

# --- patch Gameplay.tsx ---
with open('src/games/NumberHunt/Gameplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_use_effect = """  useEffect(() => {
    if (!boardContainerRef.current) return;
    const w = boardContainerRef.current.clientWidth;
    const h = boardContainerRef.current.clientHeight;
    baseSize.current = { w, h };
    initBoard(w, h);
    
    // Handle resize indicating board doesn't fit anymore
    const handleResize = () => {
      if (!boardContainerRef.current || !baseSize.current) return;
      const currentW = boardContainerRef.current.clientWidth;
      const currentH = boardContainerRef.current.clientHeight;
      
      // If window got significantly smaller, the absolute positioned items might be cut off
      if (currentW < baseSize.current.w - 20 || currentH < baseSize.current.h - 20) {
        setResizeError(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initBoard]);"""

new_use_effect = """  useEffect(() => {
    if (!boardContainerRef.current) return;
    
    let initialized = false;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      
      if (w > 100 && h > 100) {
        if (!initialized) {
          baseSize.current = { w, h };
          initBoard(w, h);
          initialized = true;
        } else if (baseSize.current && (w < baseSize.current.w - 20 || h < baseSize.current.h - 20)) {
          setResizeError(true);
        }
      }
    });
    
    observer.observe(boardContainerRef.current);
    return () => observer.disconnect();
  }, [initBoard]);"""

content = content.replace(old_use_effect, new_use_effect)

with open('src/games/NumberHunt/Gameplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# --- patch MultiplayerGameplay.tsx ---
with open('src/games/NumberHunt/multiplayer/MultiplayerGameplay.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_multi_effect = """  useEffect(() => {
    if (isPlaying) {
      if (boardContainerRef.current) {
        setLayout(generateLayout(room.config.start, room.config.end, boardContainerRef.current.clientWidth, boardContainerRef.current.clientHeight));
      }
    }
  }, [isPlaying, room.currentNumber, room.config]);"""

new_multi_effect = """  useEffect(() => {
    if (!isPlaying || !boardContainerRef.current) return;
    
    let currentLayoutGenerated = false;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width: w, height: h } = entry.contentRect;
      
      if (w > 100 && h > 100 && !currentLayoutGenerated) {
        setLayout(generateLayout(room.config.start, room.config.end, w, h));
        currentLayoutGenerated = true;
      }
    });
    
    observer.observe(boardContainerRef.current);
    return () => observer.disconnect();
  }, [isPlaying, room.config.start, room.config.end]);"""

content = content.replace(old_multi_effect, new_multi_effect)

with open('src/games/NumberHunt/multiplayer/MultiplayerGameplay.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

