"use client";

interface EngineToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function EngineToggle({ checked, onChange }: EngineToggleProps) {
  return (
    <div className="flex items-center gap-4 mt-5 text-white font-bold text-xs">
      <span>SAMPLES</span>
      <label className="relative inline-block w-10 h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="opacity-0 w-0 h-0"
        />
        <span
          className={`
            absolute cursor-pointer inset-0 rounded-full border border-white transition-[0.4s]
            before:absolute before:content-[''] before:h-3.5 before:w-3.5 before:left-0.5 before:bottom-0.5 before:bg-white before:rounded-full before:transition-[0.4s]
            ${checked ? "bg-[#ffcc00] before:translate-x-5" : "bg-[#333]"}
          `}
        />
      </label>
      <span>SYNTH</span>
    </div>
  );
}
