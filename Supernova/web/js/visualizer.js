/**
 * Supernova // JARVIS — High-Resolution Dual-Channel Stark Audio Oscilloscope
 * Real-time Web Audio FFT Analyzer, Oscilloscope Phosphor Beam & Frequency Matrix
 */

class AudioVisualizer {
  constructor(canvasId, onAudioLevel) {
    this.canvas = document.getElementById(canvasId);
    this.onAudioLevel = onAudioLevel || (() => {});
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    
    this.audioCtx = null;
    this.analyser = null;
    this.dataArray = null;
    this.timeDomainArray = null;
    this.isListening = false;
    this.simulatedLevel = 0.0;
    this.peakLevels = new Float32Array(32);
    
    this.initCanvasSize();
    this.drawIdle();
  }

  initCanvasSize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.clientWidth || 240;
    const h = this.canvas.clientHeight || 50;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  async startListening() {
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.timeDomainArray = new Uint8Array(bufferLength);
      this.isListening = true;
      this.drawLive();
    } catch (e) {
      console.warn("[Visualizer] Mic access unavailable; engaging simulated voice visualizer.", e);
      this.startSimulated();
    }
  }

  stopListening() {
    this.isListening = false;
    this.onAudioLevel(0.0);
    this.drawIdle();
  }

  startSimulated(type = "speaking") {
    this.isListening = true;
    const simLoop = () => {
      if (!this.isListening) return;
      this.simulatedLevel = Math.random() * 0.7 + 0.25;
      this.onAudioLevel(this.simulatedLevel);
      this.drawSimulated();
      requestAnimationFrame(simLoop);
    };
    simLoop();
  }

  drawIdle() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.clientWidth || 240;
    const h = this.canvas.clientHeight || 50;
    this.ctx.clearRect(0, 0, w, h);

    const cy = h / 2;

    // Glowing idle center beam line
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = "rgba(255, 204, 0, 0.6)";
    this.ctx.strokeStyle = "rgba(255, 204, 0, 0.4)";
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    
    const count = 36;
    const step = w / count;

    for (let i = 0; i <= count; i++) {
      const x = i * step;
      const wave = Math.sin(Date.now() * 0.0035 + i * 0.35) * (1.5 + Math.sin(Date.now() * 0.001) * 1.5);
      if (i === 0) this.ctx.moveTo(x, cy + wave);
      else this.ctx.lineTo(x, cy + wave);
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  drawLive() {
    if (!this.isListening || !this.analyser) {
      this.drawIdle();
      return;
    }
    requestAnimationFrame(() => this.drawLive());

    this.analyser.getByteFrequencyData(this.dataArray);
    this.analyser.getByteTimeDomainData(this.timeDomainArray);
    
    // Compute average amplitude
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    const normalized = Math.min(1.0, avg / 110.0);
    this.onAudioLevel(normalized);

    const w = this.canvas.clientWidth || 240;
    const h = this.canvas.clientHeight || 50;
    this.ctx.clearRect(0, 0, w, h);

    const barCount = 28;
    const barWidth = (w / barCount) - 3;
    const cy = h / 2;

    // 1. Draw Dual-Directional Spectrum Frequency Bars
    for (let i = 0; i < barCount; i++) {
      const val = this.dataArray[i] || 0;
      const pct = val / 255.0;
      const barHeight = Math.max(3, pct * h * 0.85);
      const x = i * (barWidth + 3);
      const y = (h - barHeight) / 2;

      // Update Peak
      if (pct > this.peakLevels[i]) {
        this.peakLevels[i] = pct;
      } else {
        this.peakLevels[i] = Math.max(0, this.peakLevels[i] - 0.015);
      }

      // Glowing bar
      const grad = this.ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, "rgba(255, 240, 130, 0.95)");
      grad.addColorStop(0.5, "rgba(255, 180, 0, 0.8)");
      grad.addColorStop(1, "rgba(255, 120, 0, 0.4)");

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(x, y, barWidth, barHeight);

      // Peak hold indicator dot
      const peakY = (h - (this.peakLevels[i] * h * 0.85)) / 2 - 2;
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(x, peakY, barWidth, 1.5);
    }

    // 2. Oscilloscope Phosphor Waveform Line across center
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#ffcc00";
    this.ctx.strokeStyle = "rgba(255, 255, 220, 0.9)";
    this.ctx.lineWidth = 1.8;
    this.ctx.beginPath();

    const sliceWidth = w / this.timeDomainArray.length;
    let x = 0;
    for (let i = 0; i < this.timeDomainArray.length; i++) {
      const v = this.timeDomainArray[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
      x += sliceWidth;
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  drawSimulated() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.clientWidth || 240;
    const h = this.canvas.clientHeight || 50;
    this.ctx.clearRect(0, 0, w, h);

    const barCount = 28;
    const barWidth = (w / barCount) - 3;
    const cy = h / 2;

    for (let i = 0; i < barCount; i++) {
      const pct = Math.max(0.1, Math.sin(Date.now() * 0.008 + i * 0.4) * 0.5 + 0.5) * this.simulatedLevel;
      const barHeight = Math.max(4, pct * h * 0.85);
      const x = i * (barWidth + 3);
      const y = (h - barHeight) / 2;

      this.ctx.fillStyle = i % 2 === 0 ? "#ffcc00" : "#ff9900";
      this.ctx.fillRect(x, y, barWidth, barHeight);
    }
  }
}

window.AudioVisualizer = AudioVisualizer;
