class AudioEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying: boolean = false;

  constructor() {
    // Read initial mute state from local storage
    const saved = localStorage.getItem('faufar_muted');
    if (saved === 'true') {
      this.muted = true;
    }
    
    // Initialize Background Music
    if (typeof window !== 'undefined') {
      this.bgmAudio = new Audio('/bg-music.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.3; // Lower volume for background
    }
  }

  init() {
    if (this.muted) return; // Don't init context if muted
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
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
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (this.muted || !this.ctx) return;
    
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors, shouldn't block gameplay
    }
  }

  playStart() {
    // A rising three-note sequence for starting the game
    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.2, 0.1);
      }, i * 150);
    });
  }

  playFound() {
    // A pleasant high "ding"
    this.playTone(880, 'sine', 0.4, 0.15); // A5
    setTimeout(() => this.playTone(1108.73, 'sine', 0.6, 0.15), 100); // C#6
  }

  playCorrect() {
    this.playFound();
  }

  playWrong() {
    // A soft low "boop"
    this.playTone(220, 'triangle', 0.3, 0.1);
  }

  playJoin() {
    // A friendly two-tone "pop"
    this.playTone(523.25, 'sine', 0.1, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.1), 100); // E5
  }

  playComplete() {
    // A small arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.5, 0.15);
      }, i * 120);
    });
  }

  playTap() {
    // A very soft, quick click/tap sound
    this.playTone(600, 'sine', 0.1, 0.05);
  }
}

export const audio = new AudioEngine();
