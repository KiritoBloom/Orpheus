"use client";

/* ============================================================
   AUDIO ENGINE — hybrid professional sampler + retro synth fallback.

   Primary: curated CC0 samples from Kenney Interface Sounds
            (100) + UI Audio (50) — CC0 1.0 — warm, chunky,
            pre-mastered, never shrill. Loaded as AudioBuffers
            via fetch + decodeAudioData for zero-latency Web Audio
            playback with micro pitch variation.

   Fallback: procedural retro synthesis (square/pulse/triangle +
             ADSR + lowpass + bitcrush) if a sample fails to load
             or the user is offline. No silent failure.

   Hum/drone remain synthesized — they are continuous ambience.
   ============================================================ */

type PulseDuty = 0.125 | 0.25 | 0.5;

const SAMPLE_MAP: Record<string, string> = {
  hover: "/sounds/ui/Audio/rollover5.ogg",          // restrained rollover, never a whine
  click: "/sounds/ui/Audio/mouseclick1.ogg",         // crisp late-90s mechanical mouse click
  tick: "/sounds/interface/Audio/tick_001.ogg",     // tiny mechanical tick
  key: "/sounds/interface/Audio/tick_002.ogg",       // key / typing
  open: "/sounds/interface/Audio/open_001.ogg",     // window open
  close: "/sounds/interface/Audio/close_001.ogg",   // window close
  select: "/sounds/interface/Audio/select_001.ogg", // boot select
  bong: "/sounds/interface/Audio/confirmation_001.ogg", // ARIA notice
  error: "/sounds/interface/Audio/error_001.ogg",   // bounded error cue
  thud: "/sounds/interface/Audio/drop_004.ogg",     // scene transition weight
  chime1: "/sounds/interface/Audio/confirmation_002.ogg",
  chime2: "/sounds/interface/Audio/confirmation_003.ogg",
  confirmAlt: "/sounds/interface/Audio/confirmation_004.ogg",
  glass: "/sounds/interface/Audio/glass_001.ogg",
  // title menu — user-provided sound effects
  menuClick: "/sound-effects/mixkit-mouse-click-close.wav",        // menu item confirm
  menuSelect: "/sound-effects/freesound_community-select-menu-47560.mp3", // menu highlight/hover
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private humNodes: AudioNode[] | null = null;
  private droneNodes: AudioNode[] | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private pulseWaves = new Map<PulseDuty, PeriodicWave>();
  private crushCurve: Float32Array<ArrayBufferLike> | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading: Promise<void> | null = null;
  enabled = true;
  private lastTickAt = 0;
  private keyBuffers: AudioBuffer[] = [];
  private keyLoading: Promise<void> | null = null;
  private lastKeyIndex = -1;

  ensure() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC =
        (window.AudioContext as unknown as typeof AudioContext) ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();

      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 12;
      comp.ratio.value = 3.5;
      comp.attack.value = 0.006;
      comp.release.value = 0.18;
      comp.connect(this.ctx.destination);
      this.limiter = comp;

      this.master = this.ctx.createGain();
      this.master.gain.value = 0.78;
      this.master.connect(comp);

      const len = this.ctx.sampleRate * 1;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.035 * w) / 1.035;
        d[i] = last * 3.2;
      }
      this.noiseBuffer = buf;

      this.pulseWaves.set(0.5, this.ctx.createPeriodicWave(new Float32Array([0, 1, 0, 1/3, 0, 1/5, 0, 1/7]), new Float32Array([0, 0, 0, 0, 0, 0, 0, 0])));
      this.pulseWaves.set(0.25, this.ctx.createPeriodicWave(
        new Float32Array([0, 0.85, 0.0, 0.42, 0.0, 0.0, 0.0, 0.22, 0.0, 0.0, 0.0, 0.13]),
        new Float32Array([0, 0.25, 0.0, -0.18, 0.0, 0.0, 0.0, 0.09, 0.0, 0.0, 0.0, -0.05])
      ));
      this.pulseWaves.set(0.125, this.ctx.createPeriodicWave(
        new Float32Array([0, 0.62, 0.0, 0.38, 0.0, 0.22, 0.0, 0.0, 0.0, 0.14, 0.0, 0.08]),
        new Float32Array([0, 0.32, 0.0, -0.21, 0.0, 0.11, 0.0, 0.0, 0.0, -0.07, 0.0, 0.04])
      ));

      const steps = 32;
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) {
        const x = (i / 1023) * 2 - 1;
        const q = Math.round(x * steps) / steps;
        curve[i] = q;
      }
      this.crushCurve = curve;

      // kick off sample preload (non-blocking)
      this.preloadSamples();
      this.preloadKeypack();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private async preloadSamples() {
    if (this.loading) return this.loading;
    if (!this.ctx) return;
    const ctx = this.ctx;
    this.loading = Promise.all(
      Object.entries(SAMPLE_MAP).map(async ([key, url]) => {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(String(res.status));
          const arr = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(arr.slice(0));
          this.buffers.set(key, buf);
        } catch {
          // silent — fallback synth will be used
        }
      })
    ).then(() => undefined);
    return this.loading;
  }

  private async preloadKeypack() {
    if (this.keyLoading) return this.keyLoading;
    if (!this.ctx) return;
    const ctx = this.ctx;
    const base = "/sound-effects/unicae_games_keyboard_soundpack_1/Single Keys";
    const urls = Array.from({ length: 32 }, (_, i) => {
      const n = String(i + 1).padStart(3, "0");
      return `${base}/keypress-${n}.wav`;
    });
    this.keyLoading = Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(encodeURI(url));
          if (!res.ok) throw new Error(String(res.status));
          const arr = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(arr.slice(0));
          this.keyBuffers.push(buf);
        } catch {
          // silent — single key missing, skip
        }
      })
    ).then(() => undefined);
    return this.keyLoading;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) { this.stopHum(); this.stopDrone(); } else { void this.ensure(); }
  }

  private ok(): boolean { return this.enabled && this.ensure() !== null; }

  /* ---------- sample playback — professional path ---------- */

  private playSample(key: string, vol = 0.85, rateJitter = 0.04): boolean {
    if (!this.ok()) return false;
    const buf = this.buffers.get(key);
    if (!buf || !this.ctx || !this.master) return false;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    // micro pitch variation so repeats feel human, not a loop
    src.playbackRate.value = 1 + (Math.random() * rateJitter * 2 - rateJitter);
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g).connect(this.master);
    src.start();
    // auto GC — source stops itself
    return true;
  }

  /* ---------- synth fallback helpers ---------- */

  private makeChain(freq: number, type: OscillatorType | "pulse25" | "pulse12", vol: number, crush = false) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    let filter: BiquadFilterNode | null = null;
    let crushNode: WaveShaperNode | null = null;
    if (type === "pulse25") { osc.setPeriodicWave(this.pulseWaves.get(0.25)!); osc.frequency.value = freq; }
    else if (type === "pulse12") { osc.setPeriodicWave(this.pulseWaves.get(0.125)!); osc.frequency.value = freq; }
    else { osc.type = type as OscillatorType; osc.frequency.value = freq; }
    const gain = ctx.createGain(); gain.gain.value = vol;
    let last: AudioNode = osc as unknown as AudioNode;
    filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = type === "square" || (type as string).startsWith("pulse") ? 2200 : 2800; filter.Q.value = 0.7; last.connect(filter); last = filter;
    if (crush && this.crushCurve) { crushNode = ctx.createWaveShaper(); (crushNode as unknown as { curve: Float32Array<ArrayBufferLike> | null }).curve = this.crushCurve; crushNode.oversample = "2x"; last.connect(crushNode); last = crushNode; }
    last.connect(gain);
    return { osc, gain, filter, crushNode };
  }

  private scheduleEnv(gain: GainNode, peak: number, dur: number, shape: "blip" | "chirp" | "thud" = "blip") {
    const ctx = this.ctx!; const now = ctx.currentTime;
    if (shape === "blip") { gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(peak, now + 0.004); gain.gain.exponentialRampToValueAtTime(peak * 0.28, now + 0.028); gain.gain.exponentialRampToValueAtTime(0.0001, now + dur); }
    else if (shape === "chirp") { gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(peak, now + 0.006); gain.gain.exponentialRampToValueAtTime(peak * 0.35, now + 0.045); gain.gain.exponentialRampToValueAtTime(0.0001, now + dur); }
    else { gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(peak, now + 0.012); gain.gain.exponentialRampToValueAtTime(peak * 0.45, now + 0.14); gain.gain.exponentialRampToValueAtTime(0.0001, now + dur); }
  }

  private playNote(freq: number, dur: number, vol: number, type: OscillatorType | "pulse25" | "pulse12", sweepTo?: number, opts: { crush?: boolean; env?: "blip" | "chirp" | "thud"; detune?: number } = {}) {
    if (!this.ok()) return;
    const ctx = this.ctx!; const jitter = opts.detune ?? (Math.random() * 6 - 3);
    const { osc, gain } = this.makeChain(freq + jitter, type, 1, opts.crush);
    this.scheduleEnv(gain, vol, dur, opts.env ?? "blip");
    if (sweepTo !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(22, sweepTo + jitter), ctx.currentTime + dur * 0.92);
    gain.connect(this.master!); osc.start(); osc.stop(ctx.currentTime + dur + 0.05);
  }

  private noiseHit(dur: number, vol: number, cutoff: number, q = 0.9) {
    if (!this.ok()) return;
    const ctx = this.ctx!; const src = ctx.createBufferSource(); src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = cutoff; bp.Q.value = q;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = cutoff * 1.6;
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    const sh = ctx.createWaveShaper();
    if (this.crushCurve) { (sh as unknown as { curve: Float32Array<ArrayBufferLike> | null }).curve = this.crushCurve; sh.oversample = "2x"; src.connect(bp).connect(lp).connect(sh).connect(g).connect(this.master!); }
    else src.connect(bp).connect(lp).connect(g).connect(this.master!);
    src.start(ctx.currentTime, Math.random() * 0.4); src.stop(ctx.currentTime + dur + 0.04);
  }

  /* ---------- ambience ---------- */

  startHum() {
    if (!this.ok() || this.humNodes) return;
    const ctx = this.ctx!; const g = ctx.createGain(); g.gain.value = 0; g.connect(this.master!);
    const osc = ctx.createOscillator(); osc.type = "triangle"; osc.frequency.value = 55; const og = ctx.createGain(); og.gain.value = 0.038; osc.connect(og).connect(g);
    const osc2 = ctx.createOscillator(); osc2.type = "sine"; osc2.frequency.value = 110; const og2 = ctx.createGain(); og2.gain.value = 0.009; osc2.connect(og2).connect(g);
    const noise = ctx.createBufferSource(); noise.buffer = this.noiseBuffer; noise.loop = true; const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 120; const ng = ctx.createGain(); ng.gain.value = 0.022; noise.connect(lp).connect(ng).connect(g);
    osc.start(); osc2.start(); noise.start(); g.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.6); this.humNodes = [osc, osc2, noise, g];
  }
  stopHum() {
    if (!this.humNodes || !this.ctx) return;
    const g = this.humNodes[this.humNodes.length - 1] as GainNode; g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    const nodes = this.humNodes; setTimeout(() => { nodes.forEach((n) => { if ("stop" in n) (n as OscillatorNode).stop?.(); try { n.disconnect(); } catch {} }); }, 750); this.humNodes = null;
  }
  startDrone() {
    if (!this.ok() || this.droneNodes) return;
    const ctx = this.ctx!; const g = ctx.createGain(); g.gain.value = 0; g.connect(this.master!);
    const a = ctx.createOscillator(); a.type = "triangle"; a.frequency.value = 54; const b = ctx.createOscillator(); b.type = "triangle"; b.frequency.value = 54.7; const c = ctx.createOscillator(); c.type = "sine"; c.frequency.value = 108.2; const cg = ctx.createGain(); cg.gain.value = 0.22; a.connect(g); b.connect(g); c.connect(cg).connect(g); a.start(); b.start(); c.start(); g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3); this.droneNodes = [a, b, c, cg, g];
  }
  stopDrone() {
    if (!this.droneNodes || !this.ctx) return;
    const g = this.droneNodes[this.droneNodes.length - 1] as GainNode; g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
    const nodes = this.droneNodes; setTimeout(() => nodes.forEach((n) => { try { (n as OscillatorNode).stop?.(); } catch {} try { n.disconnect(); } catch {} }), 1600); this.droneNodes = null;
  }

  /* ---------- PUBLIC PALETTE — samples first, synthesis fallback ---------- */

  menuHoverTick() {
    const now = Date.now();
    if (now - this.lastTickAt < 85) return;
    this.lastTickAt = now;
    if (!this.playSample("hover", 0.62, 0.03)) {
      this.playNote(420, 0.05, 0.11, "pulse12", undefined, { crush: true, env: "blip" });
      setTimeout(() => this.playNote(250, 0.04, 0.05, "triangle", undefined, { env: "blip" }), 4);
    }
  }

  click() {
    if (!this.playSample("click", 0.78, 0.04)) this.playNote(480, 0.095, 0.22, "square", 740, { crush: true, env: "chirp" });
  }

  /* title menu — user-provided samples */
  menuClick() {
    // fired when a menu item is activated (mouse click or Enter)
    if (!this.playSample("menuClick", 0.85, 0.02)) this.playNote(480, 0.095, 0.22, "square", 740, { crush: true, env: "chirp" });
  }

  menuSelect() {
    // fired when the highlight moves onto a menu item (hover or arrow keys)
    if (!this.playSample("menuSelect", 0.5, 0.03)) this.playNote(620, 0.05, 0.09, "pulse25", undefined, { env: "blip" });
  }

  keyClick() {
    if (!this.playSample("tick", 0.55, 0.06)) this.playNote(520, 0.045, 0.11, "pulse25", undefined, { env: "blip" });
  }

  // ---------- boot keyboard soundpack — per-character, humanized ----------
  bootKey() {
    if (!this.ok()) return;
    if (this.keyBuffers.length === 0) {
      // pack still loading — tiny fallback tick so typing never goes silent
      this.playNote(520 + Math.random() * 60, 0.036, 0.09, "pulse25", undefined, { env: "blip" });
      return;
    }
    let idx = Math.floor(Math.random() * this.keyBuffers.length);
    if (this.keyBuffers.length > 1 && idx === this.lastKeyIndex && Math.random() < 0.72) {
      idx = (idx + 1 + Math.floor(Math.random() * (this.keyBuffers.length - 1))) % this.keyBuffers.length;
    }
    this.lastKeyIndex = idx;
    const buf = this.keyBuffers[idx];
    const src = this.ctx!.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.92 + Math.random() * 0.16; // 0.92–1.08
    const g = this.ctx!.createGain();
    g.gain.value = 0.34 + Math.random() * 0.18; // 0.34–0.52
    const lp = this.ctx!.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 4200 + Math.random() * 1400;
    lp.Q.value = 0.6;
    const pan = this.ctx!.createStereoPanner();
    pan.pan.value = Math.random() * 0.16 - 0.08; // tiny stereo spread
    src.connect(lp).connect(pan).connect(g).connect(this.master!);
    src.start();
  }

  bootKeyEnter() {
    if (!this.ok()) return;
    if (this.keyBuffers.length === 0) {
      this.playNote(180, 0.08, 0.16, "pulse12", 165, { env: "blip" });
      return;
    }
    const idx = Math.floor(Math.random() * this.keyBuffers.length);
    const buf = this.keyBuffers[idx];
    const src = this.ctx!.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.82 + Math.random() * 0.10; // deeper, heavier return
    const g = this.ctx!.createGain();
    g.gain.value = 0.48 + Math.random() * 0.14;
    const lp = this.ctx!.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3000 + Math.random() * 600;
    lp.Q.value = 0.8;
    const pan = this.ctx!.createStereoPanner();
    pan.pan.value = Math.random() * 0.10 - 0.05;
    src.connect(lp).connect(pan).connect(g).connect(this.master!);
    src.start();
  }

  /* ---------- keypack chunks — window open/close from the keypress pack ---------- */

  /** Play one keypress sample as a soft mechanical chunk (low rate + lowpass → latch, not click). */
  private playKeyChunk(opts: { rate: number; rateJitter: number; vol: number; lp: number }): boolean {
    if (!this.ok()) return false;
    if (this.keyBuffers.length === 0) return false; // pack still loading — caller falls back
    const buf = this.keyBuffers[Math.floor(Math.random() * this.keyBuffers.length)];
    const src = this.ctx!.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = opts.rate - opts.rateJitter / 2 + Math.random() * opts.rateJitter;
    const g = this.ctx!.createGain();
    g.gain.value = opts.vol;
    const lp = this.ctx!.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = opts.lp;
    lp.Q.value = 0.7;
    const pan = this.ctx!.createStereoPanner();
    pan.pan.value = Math.random() * 0.12 - 0.06;
    src.connect(lp).connect(pan).connect(g).connect(this.master!);
    src.start();
    return true;
  }

  windowOpen() {
    // key-sound chunk — soft mechanical latch from the keypress pack, never shrill
    if (this.playKeyChunk({ rate: 0.84, rateJitter: 0.12, vol: 0.3, lp: 2600 })) return;
    if (this.playSample("open", 0.5, 0.03)) return;
    this.playNote(392, 0.13, 0.12, "square", undefined, { crush: true, env: "blip" });
    setTimeout(() => this.playNote(523, 0.16, 0.13, "pulse25", undefined, { crush: true, env: "blip" }), 70);
  }

  windowClose() {
    // deeper key return — heavier, quieter, like a latch settling
    if (this.playKeyChunk({ rate: 0.66, rateJitter: 0.1, vol: 0.27, lp: 2000 })) return;
    if (this.playSample("close", 0.45, 0.04)) return;
    this.playNote(440, 0.08, 0.1, "triangle", 280, { env: "blip" });
  }

  ding() {
    if (this.playSample("bong", 0.84, 0.02)) return;
    this.playNote(523, 0.18, 0.19, "square", undefined, { env: "blip" });
    setTimeout(() => this.playNote(659, 0.22, 0.16, "pulse25", undefined, { env: "blip" }), 85);
  }

  servoUp() {
    // keep synthesized — low mechanical growl, not in sample pack
    this.playNote(72, 0.34, 0.17, "triangle", 110, { env: "thud" });
    this.noiseHit(0.09, 0.06, 180, 1.1);
  }
  servoDown() {
    this.playNote(110, 0.30, 0.16, "triangle", 62, { env: "thud" });
    this.noiseHit(0.09, 0.06, 160, 1.1);
  }

  error() {
    if (this.playSample("error", 0.82, 0.04)) return;
    this.playNote(185, 0.14, 0.20, "square", 165, { crush: true, env: "blip" });
    setTimeout(() => this.playNote(175, 0.20, 0.20, "square", 155, { crush: true, env: "blip" }), 110);
  }

  bootBeep() {
    if (this.playSample("select", 0.72, 0.03)) return;
    this.playNote(440, 0.09, 0.17, "pulse25", undefined, { env: "blip" });
  }

  typeTick() { this.keyClick(); }

  deepThud() {
    if (this.playSample("thud", 0.86, 0.03)) {
      // layer sub thud underneath sample for weight
      this.playNote(48, 0.42, 0.18, "triangle", 32, { env: "thud" });
      return;
    }
    this.playNote(48, 0.62, 0.31, "triangle", 32, { env: "thud" });
    this.noiseHit(0.16, 0.11, 70, 0.8);
  }

  chime() {
    // try two sampled confirmations as arpeggio
    if (this.buffers.has("chime1") && this.buffers.has("chime2")) {
      this.playSample("chime1", 0.74, 0.02);
      setTimeout(() => this.playSample("chime2", 0.72, 0.02), 110);
      return;
    }
    this.playNote(392, 0.18, 0.14, "square", undefined, { env: "blip" });
    setTimeout(() => this.playNote(523, 0.18, 0.13, "pulse25", undefined, { env: "blip" }), 90);
    setTimeout(() => this.playNote(659, 0.24, 0.12, "square", undefined, { env: "blip" }), 175);
  }

  irisTick() {
    // A low, quiet clockwork tick avoids the piercing UI-ping character.
    this.playNote(420, 0.04, 0.035, "pulse12", undefined, { env: "blip" });
  }

  irisWhir(dir: "open" | "close" = "open") {
    if (!this.ok()) return;
    const from = dir === "open" ? 62 : 88;
    const to = dir === "open" ? 112 : 42;
    this.playNote(from, 0.32, 0.075, "triangle", to, { env: "thud" });
    this.noiseHit(0.06, 0.018, 120, 0.8);
  }

  bootSwell() {
    if (!this.ok()) return;
    this.playNote(42, 1.6, 0.20, "triangle", 46, { env: "thud" });
    setTimeout(() => this.noiseHit(0.9, 0.05, 55, 0.6), 40);
  }
}

export const sfx = new AudioEngine();
