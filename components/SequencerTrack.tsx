"use client";

import type { TrackId } from "@/types";

const STEP_BALL_CLASS: Record<number, string> = {
  1: "step-ball-1",
  2: "step-ball-2",
  3: "step-ball-3",
  4: "step-ball-4",
  5: "step-ball-5",
  6: "step-ball-6",
  7: "step-ball-7",
  8: "step-ball-8",
  9: "step-ball-9 step-ball-striped",
  10: "step-ball-10 step-ball-striped",
  11: "step-ball-11 step-ball-striped",
  12: "step-ball-12 step-ball-striped",
  13: "step-ball-13 step-ball-striped",
  14: "step-ball-14 step-ball-striped",
  15: "step-ball-15 step-ball-striped",
  16: "step-ball-16",
};

const TRACK_LABELS: Record<TrackId, string> = {
  kick: "KICK",
  snare: "SNARE",
  hihat: "HI-HAT",
  clap: "CLAP",
  crash: "CRASH",
};

interface SequencerTrackProps {
  trackId: TrackId;
  state: boolean[];
  volume: number;
  currentStep: number;
  onToggle: (index: number) => void;
  onClear: () => void;
  onVolumeChange: (vol: number) => void;
}

export function SequencerTrack({
  trackId,
  state,
  volume,
  currentStep,
  onToggle,
  onClear,
  onVolumeChange,
}: SequencerTrackProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 mt-2.5 w-full max-w-[950px] min-w-0">
      <div className="flex flex-col items-end w-14 sm:w-[100px] shrink-0">
        <div className="font-bold text-white text-[10px] sm:text-[11px] mb-0.5 sm:mb-1">
          {TRACK_LABELS[trackId]}
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-10 sm:w-[60px] h-1 cursor-pointer"
        />
      </div>
      <div className="flex justify-between gap-0.5 sm:gap-1 py-1 min-w-0 flex-1 overflow-x-auto">
        {Array.from({ length: 16 }, (_, i) => i + 1).map((stepNum) => {
          const stepClass = [
            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold cursor-pointer shrink-0",
            "shadow-[1px_1px_3px_rgba(0,0,0,0.4)] border border-[#333] relative z-[1]",
            "step-ball",
            STEP_BALL_CLASS[stepNum] ?? "",
            "before:content-[''] before:absolute before:w-[10px] before:h-[10px] sm:before:w-[15px] sm:before:h-[15px] before:bg-white before:rounded-full before:-z-[1]",
            stepNum === 16 ? "!bg-white text-transparent before:!content-none" : "text-black",
            state[stepNum - 1] ? "armed" : "",
            currentStep === stepNum ? "active-step" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => onToggle(stepNum - 1)}
              className={stepClass}
            >
              {stepNum < 16 ? stepNum : ""}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#f44336] border-2 border-white cursor-pointer shrink-0 relative
          before:content-[''] before:absolute before:w-[60%] before:h-0.5 before:bg-white before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-45
          after:content-[''] after:absolute after:w-[60%] after:h-0.5 after:bg-white after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:-rotate-45"
        aria-label={`Clear ${TRACK_LABELS[trackId]}`}
      />
    </div>
  );
}
