// Web Audio API procedural synthesis for mountain wind, distant birds, and sunrise warmth

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master and sub-gains
  private masterGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private birdsGain: GainNode | null = null;
  private droneGain: GainNode | null = null;

  // Wind nodes
  private windNoiseNode: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private windLfoGain: GainNode | null = null;
  private highWindFilter: BiquadFilterNode | null = null;

  // Drone nodes
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;

  // Birds timeout
  private birdTimer: number | null = null;
  private isRunning = false;

  // State volumes
  private volumes = {
    master: 0.7,
    wind: 0.65,
    birds: 0.5,
    drone: 0.25,
  };

  private init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volumes.master, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Wind Gain
    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(this.volumes.wind, this.ctx.currentTime);
    this.windGain.connect(this.masterGain);

    // Birds Gain
    this.birdsGain = this.ctx.createGain();
    this.birdsGain.gain.setValueAtTime(this.volumes.birds, this.ctx.currentTime);
    this.birdsGain.connect(this.masterGain);

    // Drone Gain
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(this.volumes.drone, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    this.setupWind();
    this.setupDrone();

    this.isInitialized = true;
  }

  private setupWind() {
    if (!this.ctx || !this.windGain) return;

    // Generate 5 seconds of pinkish mountain wind noise buffer
    const bufferSize = this.ctx.sampleRate * 5;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    }

    this.windNoiseNode = this.ctx.createBufferSource();
    this.windNoiseNode.buffer = noiseBuffer;
    this.windNoiseNode.loop = true;

    // Deep summit breeze lowpass
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(240, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    // Subtle high breeze whisper
    this.highWindFilter = this.ctx.createBiquadFilter();
    this.highWindFilter.type = 'bandpass';
    this.highWindFilter.frequency.setValueAtTime(850, this.ctx.currentTime);
    this.highWindFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const highWindGain = this.ctx.createGain();
    highWindGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    // LFO for natural, slow wind gusts
    this.windLfo = this.ctx.createOscillator();
    this.windLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12.5s cycle
    this.windLfoGain = this.ctx.createGain();
    this.windLfoGain.gain.setValueAtTime(120, this.ctx.currentTime); // modulates filter cutoff +/- 120Hz

    this.windLfo.connect(this.windLfoGain);
    this.windLfoGain.connect(this.windFilter.frequency);

    // Routing
    this.windNoiseNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);

    this.windNoiseNode.connect(this.highWindFilter);
    this.highWindFilter.connect(highWindGain);
    highWindGain.connect(this.windGain);

    this.windNoiseNode.start();
    this.windLfo.start();
  }

  private setupDrone() {
    if (!this.ctx || !this.droneGain) return;

    // Grounding warm resonant tone (108Hz and 216Hz)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc1.frequency.setValueAtTime(108, this.ctx.currentTime);

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(216, this.ctx.currentTime);

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    this.droneOsc1.connect(droneFilter);
    this.droneOsc2.connect(droneFilter);
    droneFilter.connect(subGain);
    subGain.connect(this.droneGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  // Synthesize realistic distant mountain bird chirps
  private playDistantBirdChirp() {
    if (!this.ctx || !this.birdsGain || !this.isRunning) return;

    const now = this.ctx.currentTime;
    const chirpsCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 chirps in a burst
    const baseFreq = 2200 + Math.random() * 900; // 2200 - 3100 Hz
    const panVal = Math.random() * 1.6 - 0.8; // distant stereo placement

    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime(panVal, now);
      panner.connect(this.birdsGain);
    }

    const outputNode = panner || this.birdsGain;

    for (let i = 0; i < chirpsCount; i++) {
      const chirpTime = now + i * (0.12 + Math.random() * 0.08);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const biquad = this.ctx.createBiquadFilter();

      biquad.type = 'bandpass';
      biquad.frequency.setValueAtTime(baseFreq, chirpTime);
      biquad.Q.setValueAtTime(4.0, chirpTime);

      osc.type = 'sine';
      const startF = baseFreq + (Math.random() * 400 - 200);
      const peakF = startF + 400 + Math.random() * 300;
      const endF = startF - 200;

      osc.frequency.setValueAtTime(startF, chirpTime);
      osc.frequency.exponentialRampToValueAtTime(peakF, chirpTime + 0.04);
      osc.frequency.exponentialRampToValueAtTime(endF, chirpTime + 0.09);

      // Delicate envelope for distant sound
      const peakVol = 0.08 + Math.random() * 0.04;
      gain.gain.setValueAtTime(0.0001, chirpTime);
      gain.gain.linearRampToValueAtTime(peakVol, chirpTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, chirpTime + 0.1);

      osc.connect(biquad);
      biquad.connect(gain);
      gain.connect(outputNode);

      osc.start(chirpTime);
      osc.stop(chirpTime + 0.12);
    }

    // Schedule next bird call in 7 to 16 seconds
    this.scheduleNextBird();
  }

  private scheduleNextBird() {
    if (!this.isRunning) return;
    const nextIntervalMs = 7000 + Math.random() * 11000;
    this.birdTimer = window.setTimeout(() => {
      this.playDistantBirdChirp();
    }, nextIntervalMs);
  }

  public playSingingBowl() {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const freqs = [384, 768, 1152, 1536];
    const decays = [5.5, 4.2, 3.0, 2.0];
    const amplitudes = [0.18, 0.09, 0.04, 0.02];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(amplitudes[idx], now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + decays[idx] + 0.1);
    });
  }

  public start() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isRunning = true;
    this.scheduleNextBird();
  }

  public pause() {
    this.isRunning = false;
    if (this.birdTimer) {
      clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  public setMasterVolume(vol: number) {
    this.volumes.master = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volumes.master, this.ctx.currentTime, 0.05);
    }
  }

  public setWindVolume(vol: number) {
    this.volumes.wind = Math.max(0, Math.min(1, vol));
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(this.volumes.wind, this.ctx.currentTime, 0.05);
    }
  }

  public setBirdsVolume(vol: number) {
    this.volumes.birds = Math.max(0, Math.min(1, vol));
    if (this.birdsGain && this.ctx) {
      this.birdsGain.gain.setTargetAtTime(this.volumes.birds, this.ctx.currentTime, 0.05);
    }
  }

  public setDroneVolume(vol: number) {
    this.volumes.drone = Math.max(0, Math.min(1, vol));
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(this.volumes.drone, this.ctx.currentTime, 0.05);
    }
  }

  public getVolumes() {
    return { ...this.volumes };
  }
}

export const ambientSound = new AmbientSoundEngine();
