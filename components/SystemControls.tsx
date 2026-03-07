"use client";

interface SystemControlsProps {
  onRandom: () => void;
  onSave: () => void;
  onLoad: () => void;
}

export function SystemControls({ onRandom, onSave, onLoad }: SystemControlsProps) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">
      <button
        type="button"
        onClick={onRandom}
        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-[20px] border-none cursor-pointer font-bold text-sm sm:text-base bg-[#ffcc00] text-[#333]"
      >
        Classic Beats
      </button>
      <button
        type="button"
        onClick={onSave}
        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-[20px] border-none cursor-pointer font-bold text-sm sm:text-base bg-white text-[#38761d]"
      >
        Save Pattern
      </button>
      <button
        type="button"
        onClick={onLoad}
        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-[20px] border-none cursor-pointer font-bold text-sm sm:text-base bg-[#333] text-white"
      >
        Load Pattern
      </button>
    </div>
  );
}
