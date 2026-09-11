import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add a global interaction listener to start BGM if not started
use_effect = """  const [isMuted, setIsMuted] = useState(audio.muted);
  
  useEffect(() => {
    const handleFirstInteraction = () => {
      audio.playBGM();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);"""

content = content.replace("  const [isMuted, setIsMuted] = useState(audio.muted);", use_effect)

with open('src/App.tsx', 'w') as f:
    f.write(content)
