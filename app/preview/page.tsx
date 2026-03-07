/**
 * Preview / OG Image Page
 *
 * Screenshot this page for iMessage link previews, social sharing, and Open Graph.
 * Visit /preview to capture at 1200×630 (e.g. browser zoom or responsive).
 *
 * Optional: Save the screenshot as public/social_preview.png and it will be
 * used automatically for og:image / Twitter cards.
 */

import Image from "next/image";

const BALL_COLORS: Record<number, string> = {
  1: "#ffcc00",
  2: "#0033ff",
  3: "#ff0000",
  4: "#660099",
  5: "#ff6600",
  6: "#006600",
  7: "#990000",
  8: "#000000",
  9: "#ffcc00",
  10: "#0033ff",
  11: "#ff0000",
  12: "#660099",
  13: "#ff6600",
  14: "#006600",
  15: "#990000",
};

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-[#2a2a2a] flex items-start justify-center pt-6 px-4 pb-10">
      <div className="w-full max-w-[1200px]" style={{ aspectRatio: "1200/630" }}>
        <div
          className="w-full h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ backgroundColor: "#38761d" }}
        >
          {/* Top: title row with favicon + name */}
          <div className="flex items-center gap-4 pt-8 pb-4 px-8 sm:px-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-[#333] shrink-0 bg-white flex items-center justify-center">
              <Image
                src="/Magic_8_Ball_FavIcon.png"
                alt=""
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                Billiards Master Sequencer
              </h1>
              <p className="text-white/90 text-sm sm:text-base mt-0.5">
                16-step drum sequencer · Real billiards samples
              </p>
            </div>
          </div>

          {/* Middle: rack + tagline + balls */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 px-6 sm:px-10 py-6">
            {/* Mini rack (triangle of balls) */}
            <div className="relative w-[140px] h-[112px] shrink-0">
              {[
                [1],
                [2, 3],
                [4, 8, 5],
                [6, 7, 9, 10],
                [11, 12, 13, 14, 15],
              ].map((row, rowIdx) => {
                const startX = (140 - row.length * 26) / 2;
                return row.map((num, i) => (
                  <div
                    key={`${rowIdx}-${num}`}
                    className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-[#333] shadow-md ${num === 8 ? "text-white" : "text-black"}`}
                    style={{
                      left: startX + i * 26,
                      top: rowIdx * 26,
                      backgroundColor: BALL_COLORS[num] ?? "#fff",
                      backgroundImage: num >= 9 ? "linear-gradient(to top, white 25%, transparent 25%, transparent 75%, white 75%)" : undefined,
                    }}
                  >
                    {num}
                  </div>
                ));
              })}
              {/* Cue ball */}
              <div
                className="absolute w-6 h-6 rounded-full border-2 border-[#333] left-1/2 -translate-x-1/2 bg-white"
                style={{ top: -28 }}
              />
            </div>

            <div className="text-center md:text-left max-w-md">
              <p className="text-white text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed">
                Build beats with a pool table. Click steps to arm kicks, snares, hi-hats, claps & crashes. Toggle samples or synth—save and load patterns.
              </p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="rounded-full bg-white/25 px-3 py-1 text-white text-xs font-semibold">
                  KICK · SNARE · HI-HAT
                </span>
                <span className="rounded-full bg-white/25 px-3 py-1 text-white text-xs font-semibold">
                  CLAP · CRASH
                </span>
              </div>
            </div>

            {/* Extra balls row */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-[#333] shadow ${n === 8 ? "text-white" : "text-black"}`}
                  style={{
                    backgroundColor: BALL_COLORS[n] ?? "#fff",
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* Footer: Jess Chase */}
          <div className="px-6 sm:px-10 py-4 border-t border-[#2d5c16] flex items-center justify-between flex-wrap gap-2">
            <p className="text-white/90 text-sm">
              Made with real billiards samples by{" "}
              <a
                href="https://www.jesschase.com/about"
                target="_blank"
                rel="noreferrer noopener"
                className="underline text-white font-medium"
              >
                Jess Chase
              </a>
            </p>
            <p className="text-white/70 text-xs">Web · Play in browser</p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Screenshot this card for iMessage / social link previews · 1200×630 recommended
        </p>
        <p className="mt-1 text-center text-xs text-gray-500">
          Save as <code className="bg-gray-800 px-1 rounded">public/social_preview.png</code> to use as og:image
        </p>
      </div>
    </div>
  );
}
