"use client";

import type { SavedPattern, TrackId, TrackState } from "@/types";
import { TRACK_IDS, STORAGE_KEY } from "@/types";

function toBooleanState(arr: (boolean | number)[]): TrackState {
  return arr.slice(0, 16).map(Boolean);
}

export const DEFAULT_PATTERN: SavedPattern = {
  bpm: 250,
  kick: {
    state: toBooleanState([1, 0, 3, 0, 0, 0, 7, 8, 0, 10, 0, 0, 0, 14, 0, 0]),
    vol: 0.8,
  },
  snare: {
    state: toBooleanState([0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 12, 0, 0, 15, 16]),
    vol: 0.6,
  },
  hihat: {
    state: toBooleanState([0, 2, 0, 4, 0, 6, 0, 0, 9, 0, 11, 0, 13, 0, 0, 16]),
    vol: 0.4,
  },
  clap: {
    state: Array.from({ length: 16 }, (_, i) => [5, 12].includes(i)),
    vol: 0.5,
  },
  crash: {
    state: Array.from({ length: 16 }, (_, i) => [0, 10].includes(i)),
    vol: 0.4,
  },
};

export function loadFromStorage(): SavedPattern | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object" || !("bpm" in data)) return null;
    const bpm = Number((data as { bpm?: unknown }).bpm) || 120;
    const result: SavedPattern = {
      bpm,
      kick: { state: Array(16).fill(false), vol: 0.8 },
      snare: { state: Array(16).fill(false), vol: 0.6 },
      hihat: { state: Array(16).fill(false), vol: 0.4 },
      clap: { state: Array(16).fill(false), vol: 0.5 },
      crash: { state: Array(16).fill(false), vol: 0.4 },
    };
    for (const key of TRACK_IDS) {
      const t = (data as Record<string, { state?: unknown; vol?: unknown }>)[key];
      if (t && Array.isArray(t.state)) {
        result[key].state = toBooleanState(t.state);
      }
      if (t && typeof t.vol === "number") result[key].vol = t.vol;
      if (t && typeof t.vol === "string") result[key].vol = parseFloat(t.vol) || result[key].vol;
    }
    return result;
  } catch {
    return null;
  }
}

export function saveToStorage(pattern: SavedPattern): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pattern));
}

export function randomizeState(): TrackState {
  return Array.from({ length: 16 }, () => Math.random() > 0.85);
}
