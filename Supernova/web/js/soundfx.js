// ═══════════════════════════════════════════════════════════════
//  SUPERNOVA / JARVIS — Stark Industries Web Audio Synthesizer
//  Cinematic Sound FX Suite (100% Web Audio API, Zero Files Needed)
// ═══════════════════════════════════════════════════════════════

class JarvisSoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  _init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Startup Power-Up / Repulsor Chime
  playStartup() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Low sub-bass power surge
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, now);
    osc1.frequency.exponentialRampToValueAtTime(360, now + 1.2);
    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.5);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 1.5);

    // High harmonic power chime
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.8);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 1.4);
    gain2.gain.setValueAtTime(0.001, now + 0.3);
    gain2.gain.linearRampToValueAtTime(0.09, now + 0.8);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.3);
    osc2.stop(now + 1.6);
  }

  // 2. High-Tech Mic / Voice Activation Chirp
  playActivate() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.07); // A5
    osc.frequency.setValueAtTime(1174.66, now + 0.14); // D6
    
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  // 3. Deactivate / Sleep Chime
  playDeactivate() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(587.33, now + 0.08);
    osc.frequency.setValueAtTime(392.00, now + 0.16);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 4. Processing / Calculation Data Chirp
  playProcessing() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200 + Math.random() * 800, now);
    osc.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, now + 0.06);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  // 5. Transmission / Message Sent Confirmation
  playSend() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // 6. UI Button Hover Blip
  playHover() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1900, now);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // 7. UI Click
  playClick() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 8. Shockwave Blast Pulse Sound
  playShockwave() {
    if (!this.enabled) return;
    this._init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

window.JarvisSoundFX = JarvisSoundFX;
