import re

with open('src/lib/audio.ts', 'r') as f:
    content = f.read()

# Add bgm variables
bgm_vars = """  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying: boolean = false;"""

content = content.replace("  private ctx: AudioContext | null = null;\n  public muted: boolean = false;", bgm_vars)

# In constructor, init bgmAudio
bgm_init = """    if (saved === 'true') {
      this.muted = true;
    }
    
    // Initialize Background Music
    if (typeof window !== 'undefined') {
      this.bgmAudio = new Audio('/bg-music.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.3; // Lower volume for background
    }"""
content = content.replace("    if (saved === 'true') {\n      this.muted = true;\n    }", bgm_init)


# In toggleMute, pause/play BGM
toggle_mute = """  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('faufar_muted', this.muted.toString());
    
    if (!this.muted) {
      this.init(); // initialize/resume if unmuted
      if (this.isBgmPlaying && this.bgmAudio) {
        this.bgmAudio.play().catch(() => {});
      }
    } else {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
      }
    }
  }

  // New Methods for BGM
  playBGM() {
    this.isBgmPlaying = true;
    if (!this.muted && this.bgmAudio) {
      this.bgmAudio.play().catch(() => {
        // Autoplay policy might block this until user interacts
      });
    }
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }"""

content = content.replace("""  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('faufar_muted', this.muted.toString());
    if (!this.muted) {
      this.init(); // initialize/resume if unmuted
    }
  }""", toggle_mute)

with open('src/lib/audio.ts', 'w') as f:
    f.write(content)
