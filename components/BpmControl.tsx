"use client";

interface BpmControlProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
}

export function BpmControl({ bpm, onBpmChange }: BpmControlProps) {
  return (
    <div className="mt-4 text-xs text-white flex flex-col items-center">
      <label htmlFor="bpm-slider" className="flex items-center gap-1">
        TEMPO <span id="bpm-display" className="hidden">{bpm}</span>
      </label>
      <input
        id="bpm-slider"
        type="range"
        min={0}
        max={800}
        value={bpm}
        onChange={(e) => onBpmChange(Number(e.target.value))}
        className="mt-1"
      />
    </div>
  );
}
