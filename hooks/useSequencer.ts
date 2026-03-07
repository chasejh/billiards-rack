"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TrackId } from "@/types";
import { TRACK_IDS } from "@/types";
import type { GainNodes, Buffers } from "@/lib/audio";
import {
  getAudioContext,
  initAudio,
  playSample,
  playKickSynth,
  playSnareSynth,
  playHiHatSynth,
  playClapSynth,
  playCrashSynth,
  triggerSound,
} from "@/lib/audio";
import { DEFAULT_PATTERN, loadFromStorage, randomizeState, saveToStorage } from "@/lib/pattern";
import type { SavedPattern, TrackState } from "@/types";

const STEPS = 16;

function getInitialState(): {
  bpm: number;
  useSynth: boolean;
  trackState: Record<TrackId, TrackState>;
  trackVol: Record<TrackId, number>;
} {
  const saved = loadFromStorage();
  if (saved) {
    return {
      bpm: saved.bpm,
      useSynth: false,
      trackState: {
        kick: saved.kick.state.slice(),
        snare: saved.snare.state.slice(),
        hihat: saved.hihat.state.slice(),
        clap: saved.clap.state.slice(),
        crash: saved.crash.state.slice(),
      },
      trackVol: {
        kick: saved.kick.vol,
        snare: saved.snare.vol,
        hihat: saved.hihat.vol,
        clap: saved.clap.vol,
        crash: saved.crash.vol,
      },
    };
  }
  return {
    bpm: DEFAULT_PATTERN.bpm,
    useSynth: false,
    trackState: {
      kick: DEFAULT_PATTERN.kick.state.slice(),
      snare: DEFAULT_PATTERN.snare.state.slice(),
      hihat: DEFAULT_PATTERN.hihat.state.slice(),
      clap: DEFAULT_PATTERN.clap.state.slice(),
      crash: DEFAULT_PATTERN.crash.state.slice(),
    },
    trackVol: {
      kick: DEFAULT_PATTERN.kick.vol,
      snare: DEFAULT_PATTERN.snare.vol,
      hihat: DEFAULT_PATTERN.hihat.vol,
      clap: DEFAULT_PATTERN.clap.vol,
      crash: DEFAULT_PATTERN.crash.vol,
    },
  };
}

export function useSequencer() {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const initial = getInitialState();
  const [bpm, setBpm] = useState(initial.bpm);
  const [useSynth, setUseSynth] = useState(false);
  const [trackState, setTrackState] = useState<Record<TrackId, TrackState>>(
    initial.trackState
  );
  const [trackVol, setTrackVol] = useState<Record<TrackId, number>>(
    initial.trackVol
  );

  const audioCtxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Buffers>({
    kick: null,
    snare: null,
    hihat: null,
    clap: null,
    crash: null,
  });
  const gainsRef = useRef<GainNodes | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tempoMs = 60000 / bpm;

  const advance = useCallback(() => {
    setCurrentStep((s) => {
      const next = (s % STEPS) + 1;
      const idx = next - 1;
      const ctx = audioCtxRef.current;
      const gains = gainsRef.current;
      const buffers = buffersRef.current;
      if (ctx && gains) {
        for (const key of TRACK_IDS) {
          if (trackState[key][idx]) {
            triggerSound(
              ctx,
              key,
              useSynth,
              buffers,
              gains,
              playSample,
              playKickSynth,
              playSnareSynth,
              playHiHatSynth,
              playClapSynth,
              playCrashSynth
            );
          }
        }
      }
      return next;
    });
  }, [trackState, useSynth]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(advance, tempoMs);
    intervalRef.current = id;
    return () => {
      clearInterval(id);
      intervalRef.current = null;
    };
  }, [running, tempoMs, advance]);

  const toggleStep = useCallback((track: TrackId, index: number) => {
    setTrackState((prev) => {
      const next = { ...prev };
      next[track] = [...next[track]];
      next[track][index] = !next[track][index];
      return next;
    });
  }, []);

  const clearTrack = useCallback((track: TrackId) => {
    setTrackState((prev) => ({
      ...prev,
      [track]: Array(STEPS).fill(false),
    }));
  }, []);

  const setVolume = useCallback((track: TrackId, vol: number) => {
    setTrackVol((prev) => ({ ...prev, [track]: vol }));
    const g = gainsRef.current?.[track];
    if (g) g.gain.value = vol;
  }, []);

  const playPause = useCallback(async () => {
    if (running) {
      setRunning(false);
      setCurrentStep(1);
      return;
    }
    if (!audioCtxRef.current) {
      audioCtxRef.current = getAudioContext();
      await initAudio(
        audioCtxRef.current,
        buffersRef,
        gainsRef,
        trackVol
      );
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();
    setCurrentStep(1);
    setRunning(true);
  }, [running, trackVol]);

  const randomize = useCallback(() => {
    setTrackState((prev) => {
      const next = { ...prev };
      for (const key of TRACK_IDS) {
        next[key] = randomizeState();
      }
      return next;
    });
  }, []);

  const savePattern = useCallback(() => {
    const pattern: SavedPattern = {
      bpm,
      kick: { state: trackState.kick, vol: trackVol.kick },
      snare: { state: trackState.snare, vol: trackVol.snare },
      hihat: { state: trackState.hihat, vol: trackVol.hihat },
      clap: { state: trackState.clap, vol: trackVol.clap },
      crash: { state: trackState.crash, vol: trackVol.crash },
    };
    saveToStorage(pattern);
  }, [bpm, trackState, trackVol]);

  const loadPattern = useCallback(() => {
    const saved = loadFromStorage();
    if (!saved) return;
    setBpm(saved.bpm);
    setTrackState({
      kick: saved.kick.state.slice(),
      snare: saved.snare.state.slice(),
      hihat: saved.hihat.state.slice(),
      clap: saved.clap.state.slice(),
      crash: saved.crash.state.slice(),
    });
    setTrackVol({
      kick: saved.kick.vol,
      snare: saved.snare.vol,
      hihat: saved.hihat.vol,
      clap: saved.clap.vol,
      crash: saved.crash.vol,
    });
    gainsRef.current &&
      TRACK_IDS.forEach((key) => {
        gainsRef.current![key].gain.value = saved[key].vol;
      });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        playPause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playPause]);

  return {
    running,
    currentStep,
    bpm,
    setBpm,
    useSynth,
    setUseSynth,
    trackState,
    trackVol,
    toggleStep,
    clearTrack,
    setVolume,
    playPause,
    randomize,
    savePattern,
    loadPattern,
  };
}
