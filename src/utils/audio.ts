/**
 * High-performance audio & voice synthesis engine using Web Audio API + Web Speech API.
 * Ensures zero external asset dependencies, zero latency, and crystal-clear sound & voice feedback.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled = true;
  private voice: SpeechSynthesisVoice | null = null;
  private isUnlocked = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoiceEngine();
      // Auto-unlock on first user gesture
      const unlockEvents = ['pointerdown', 'touchstart', 'mousedown', 'keydown'];
      const unlock = () => {
        this.unlockAudio();
        unlockEvents.forEach((ev) => window.removeEventListener(ev, unlock));
      };
      unlockEvents.forEach((ev) => window.addEventListener(ev, unlock, { passive: true }));
    }
  }

  public unlockAudio() {
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
    this.isUnlocked = true;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private initVoiceEngine() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer high-quality English voice
      const preferred =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Zira') ||
              v.name.includes('Karen') ||
              v.name.includes('Victoria'))
        ) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        this.voice = preferred;
      }
    };

    selectVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = selectVoice;
    }
  }

  /**
   * Spoken voice speech announcement
   */
  public speak(text: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      this.unlockAudio();

      // Cancel any ongoing or stuck utterance
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }
      utterance.rate = 1.08; // Crisp, professional pace
      utterance.pitch = 1.02;
      utterance.volume = 1.0;

      // Retain reference to prevent garbage collection bug in Chromium
      this.activeUtterance = utterance;
      utterance.onend = () => {
        this.activeUtterance = null;
      };
      utterance.onerror = () => {
        this.activeUtterance = null;
      };

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis may be restricted or unsupported
    }
  }

  /**
   * Winning Trade Sound + Voice Announcement
   */
  playWin(speakAnnouncement = true) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        // Arpeggio chord: C5 -> E5 -> G5 -> C6
        osc1.frequency.setValueAtTime(523.25, now);
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
        osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);
        osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.24);

        osc2.frequency.setValueAtTime(1046.5, now);
        osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.1);
        osc1.stop(now + 0.55);
        osc2.stop(now + 0.55);
      }
    } catch {
      // Ignore
    }

    if (speakAnnouncement) {
      setTimeout(() => {
        this.speak('Trade Won!');
      }, 100);
    }
  }

  /**
   * Losing Trade Sound + Voice Announcement
   */
  playLoss(speakAnnouncement = true) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Ignore
    }

    if (speakAnnouncement) {
      setTimeout(() => {
        this.speak('Trade Lost.');
      }, 80);
    }
  }

  /**
   * Order Placed Sound + Voice ("Call Order Placed" / "Put Order Placed")
   */
  playTradePlaced(direction: 'BUY' | 'SELL', stakeAmount?: number) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        if (direction === 'BUY') {
          osc.frequency.setValueAtTime(587.33, now); // D5
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        } else {
          osc.frequency.setValueAtTime(659.25, now); // E5
          osc.frequency.exponentialRampToValueAtTime(440, now + 0.12); // A4
        }

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch {
      // Ignore
    }

    const directionName = direction === 'BUY' ? 'Call' : 'Put';
    const message = stakeAmount
      ? `${directionName} order placed. Stake ${stakeAmount.toFixed(0)}`
      : `${directionName} order placed`;
    this.speak(message);
  }

  /**
   * Aladdin Forex Sniper Signal Announcement
   */
  playForexSignal(symbol: string, direction: 'BUY' | 'SELL', entryPrice: number) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';

        if (direction === 'BUY') {
          osc1.frequency.setValueAtTime(523.25, now);
          osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.1);
          osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.22);
          osc2.frequency.setValueAtTime(1046.5, now);
          osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.22);
        } else {
          osc1.frequency.setValueAtTime(880, now);
          osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
          osc1.frequency.exponentialRampToValueAtTime(440, now + 0.22);
          osc2.frequency.setValueAtTime(440, now);
          osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.22);
        }

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      }
    } catch {
      // Ignore
    }

    const cleanSymbol = symbol.replace('/', ' ');
    const actionText = direction === 'BUY' ? 'Buy' : 'Sell';
    setTimeout(() => {
      this.speak(`Aladdin Signal. ${actionText} ${cleanSymbol} at ${entryPrice}`);
    }, 120);
  }

  /**
   * Radar pulse scan audio tick
   */
  playRadarScan() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore
    }
  }

  /**
   * UI button click sound - crisp, audible tactile mechanical blip
   */
  playTradeClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.06);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore
    }
  }

  /**
   * Center Torch/Mode Switcher Toggle Sound - rich, futuristic ascending cyber harmonic tone
   */
  playTorchSwitch() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      // Ascending harmonic sweep
      osc1.frequency.setValueAtTime(620, now);
      osc1.frequency.exponentialRampToValueAtTime(1240, now + 0.12);

      osc2.frequency.setValueAtTime(930, now);
      osc2.frequency.exponentialRampToValueAtTime(1860, now + 0.14);

      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  /**
   * Stake Copied announcement
   */
  playCopied() {
    this.playTradeClick();
    this.speak('Stake copied');
  }

  /**
   * Grand Celebration Fanfare & Voice
   */
  playCelebration() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (this.ctx) {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);

          gain.gain.setValueAtTime(0.14, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.45);
        });
      }
    } catch {
      // Ignore
    }

    setTimeout(() => {
      this.speak('Target achieved! Congratulations!');
    }, 250);
  }
}

export const soundController = new SoundController();
