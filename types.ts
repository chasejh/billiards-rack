export type TrackId = "kick" | "snare" | "hihat" | "clap" | "crash";

export type TrackState = boolean[]; // 16 steps

export interface TrackData {
  state: TrackState;
  vol: number;
}

export interface SavedPattern {
  bpm: number;
  kick: TrackData;
  snare: TrackData;
  hihat: TrackData;
  clap: TrackData;
  crash: TrackData;
}

export const TRACK_IDS: TrackId[] = ["kick", "snare", "hihat", "clap", "crash"];

export const STORAGE_KEY = "billiardsPatternFinal";
