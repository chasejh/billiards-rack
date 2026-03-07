"use client";

import type { TrackId } from "@/types";

const SAMPLE_PATHS: Record<TrackId, string> = {
  kick: "/samples/kick_pocket.wav",
  snare: "/samples/snare_slap.wav",
  hihat: "/samples/hihat_click.wav",
  clap: "/samples/clap_cuehit.wav",
  crash: "/samples/crash_break.wav",
};

export type GainNodes = Record<TrackId, GainNode>;
export type Buffers = Record<TrackId, AudioBuffer | null>;

export function getAudioContext(): AudioContext {
  const Ctx = typeof window !== "undefined" && (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
  if (!Ctx) throw new Error("AudioContext not available");
  return new Ctx();
}

export async function loadSample(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return ctx.decodeAudioData(buf);
}

export async function initAudio(
  ctx: AudioContext,
  buffersRef: { current: Buffers },
  gainsRef: { current: GainNodes | null },
  initialVolumes: Record<TrackId, number>
): Promise<void> {
  const dest = ctx.destination;
  const gainNodes: GainNodes = {} as GainNodes;
  for (const key of Object.keys(SAMPLE_PATHS) as TrackId[]) {
    const g = ctx.createGain();
    g.gain.value = initialVolumes[key] ?? 0.8;
    g.connect(dest);
    gainNodes[key] = g;
    try {
      buffersRef.current[key] = await loadSample(ctx, SAMPLE_PATHS[key]);
    } catch (e) {
      console.warn(`Sample not loaded for ${key}:`, e instanceof Error ? e.message : String(e));
      buffersRef.current[key] = null;
    }
  }
  gainsRef.current = gainNodes;
}

export function playSample(
  ctx: AudioContext,
  buffers: Buffers,
  gains: GainNodes,
  key: TrackId
): void {
  const buf = buffers[key];
  if (!buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(gains[key]);
  src.start(0);
}

// --- Synth engines ---
export function playKickSynth(ctx: AudioContext, gain: GainNode): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(gain);
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  g.gain.setValueAtTime(1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playSnareSynth(ctx: AudioContext, gain: GainNode): void {
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const ch = noiseBuffer.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  noise.buffer = noiseBuffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.4, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  noise.connect(g).connect(gain);
  noise.start(now);
}

export function playHiHatSynth(ctx: AudioContext, gain: GainNode): void {
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const ch = noiseBuffer.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 8000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.2, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  noise.connect(filter).connect(g).connect(gain);
  noise.start(now);
}

export function playClapSynth(ctx: AudioContext, gain: GainNode): void {
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const ch = noiseBuffer.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  noise.connect(filter).connect(g).connect(gain);
  noise.start(now);
}

export function playCrashSynth(ctx: AudioContext, gain: GainNode): void {
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
  const ch = noiseBuffer.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  noise.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 3000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.3, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
  noise.connect(filter).connect(g).connect(gain);
  noise.start(now);
}

export function triggerSound(
  ctx: AudioContext,
  key: TrackId,
  useSynth: boolean,
  buffers: Buffers,
  gains: GainNodes,
  playSampleFn: typeof playSample,
  playKick: typeof playKickSynth,
  playSnare: typeof playSnareSynth,
  playHiHat: typeof playHiHatSynth,
  playClap: typeof playClapSynth,
  playCrash: typeof playCrashSynth
): void {
  if (!gains[key]) return;
  if (useSynth) {
    if (key === "kick") playKick(ctx, gains.kick);
    if (key === "snare") playSnare(ctx, gains.snare);
    if (key === "hihat") playHiHat(ctx, gains.hihat);
    if (key === "clap") playClap(ctx, gains.clap);
    if (key === "crash") playCrash(ctx, gains.crash);
  } else {
    playSampleFn(ctx, buffers, gains, key);
  }
}
