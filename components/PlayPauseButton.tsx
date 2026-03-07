"use client";

interface PlayPauseButtonProps {
  running: boolean;
  onClick: () => void;
}

export function PlayPauseButton({ running, onClick }: PlayPauseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-9 h-9 rounded-full border border-[#333] cursor-pointer mt-12 sm:mt-[100px] relative
        flex items-center justify-center
        bg-red-600
        before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:z-[1]
        ${running ? "before:!content-[''] after:!content-[''] before:!w-[70%] before:!h-0.5 before:!bg-black before:!rounded-none before:rotate-45 after:absolute after:w-[70%] after:h-0.5 after:bg-black after:rotate-[-45deg] after:z-[2]" : "after:content-[''] after:absolute after:border-[5px_solid_transparent] after:border-l-[8px] after:border-l-black after:translate-x-0.5 after:z-[2]"}
      `}
      aria-label={running ? "Stop" : "Play"}
    />
  );
}
