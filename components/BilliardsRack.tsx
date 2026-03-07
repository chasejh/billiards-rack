"use client";

const RACK_STRUCTURE = [
  [1],
  [2, 3],
  [4, 8, 5],
  [6, 7, 9, 10],
  [11, 12, 13, 14, 15],
];

const BALL_CLASS: Record<number, string> = {
  1: "ball-1",
  2: "ball-2",
  3: "ball-3",
  4: "ball-4",
  5: "ball-5",
  6: "ball-6",
  7: "ball-7",
  8: "ball-8",
  9: "ball-9 striped",
  10: "ball-10 striped",
  11: "ball-11 striped",
  12: "ball-12 striped",
  13: "ball-13 striped",
  14: "ball-14 striped",
  15: "ball-15 striped",
  16: "cue-ball",
};

interface BilliardsRackProps {
  currentStep: number;
}

export function BilliardsRack({ currentStep }: BilliardsRackProps) {
  let rowY = 0;
  const rackBalls: { num: number; left: number; top: number }[] = [];
  RACK_STRUCTURE.forEach((row) => {
    const startX = (200 - row.length * 36) / 2;
    row.forEach((num, i) => {
      rackBalls.push({
        num,
        left: startX + i * 36,
        top: rowY,
      });
    });
    rowY += 36;
  });

  const cueBall = { num: 16, left: (200 - 40) / 2, top: -40 };
  const ordered = [...rackBalls, cueBall].sort((a, b) => a.num - b.num);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-[200px] h-[160px] translate-y-[60px]"
        aria-label="Billiards rack"
      >
        {ordered.map(({ num, left, top }) => (
          <div
            key={num}
            data-num={num}
            className={`
              absolute w-10 h-10 rounded-full flex items-center justify-center font-bold text-black cursor-default
              shadow-[2px_2px_5px_rgba(0,0,0,0.5)] border border-[#333] z-[1]
              before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:-z-[1]
              ${BALL_CLASS[num] ?? ""}
              ${num === 16 ? "!bg-white text-transparent border-[3px] border-[#333] z-10 before:!content-none" : ""}
              ${currentStep === num ? "active-step" : ""}
            `}
            style={{ left: `${left}px`, top: `${top}px` }}
          >
            {num < 16 ? num : null}
          </div>
        ))}
      </div>
    </div>
  );
}
