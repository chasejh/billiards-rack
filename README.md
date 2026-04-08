# Billiards Master Sequencer

A **16-step drum sequencer** with a billiards theme: the rack of numbered balls doubles as a visual metronome, and each sequencer track is a row of pool-ball steps you can click to arm hits.

## Running the app

The project is set up as a **Next.js** app (React, TypeScript, Tailwind).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Build for production: `npm run build` then `npm start`.

**Samples:** In sample mode, the app loads WAVs from `/public/samples/`. Add these files for full sound: `kick_pocket.wav`, `snare_slap.wav`, `hihat_click.wav`, `clap_cuehit.wav`, `crash_break.wav`. Without them, sample mode stays silent; the SYNTH toggle still works.

## What It Does

- **Play/stop** the sequencer (button or Spacebar). On each step, any armed pads on the five tracks trigger sound.
- **Five tracks**: KICK, SNARE, HI-HAT, CLAP, CRASH. Each has 16 steps (balls). Click a step to toggle it on/off (armed).
- **Two sound engines**: **SAMPLES** (WAV files from `samples/`) or **SYNTH** (Web Audio oscillators/noise). Toggle between them with the switch.
- **Tempo**: BPM slider (0–800) controls step interval. Display is hidden in the original UI but the value drives timing.
- **Per-track volume** sliders and **clear** buttons to reset that track’s pattern.
- **Classic Beats**: Randomizes which steps are armed on all tracks (~15% chance per step).
- **Save / Load**: Persists one pattern (including BPM and volumes) to `localStorage` under `billiardsPatternFinal`.

## Project Structure (Next.js)

- **app/** – `layout.tsx`, `page.tsx`, `globals.css` (Tailwind + ball/step CSS).
- **components/** – `BilliardsRack`, `SequencerTrack`, `EngineToggle`, `BpmControl`, `PlayPauseButton`, `SystemControls`.
- **hooks/useSequencer.ts** – Sequencer state, interval, play/pause, save/load, randomize, and audio trigger.
- **lib/audio.ts** – Web Audio: sample loading, gain nodes, sample playback, synth engines.
- **lib/pattern.ts** – Default pattern, load/save from localStorage, randomize helper.
- **types.ts** – `TrackId`, `TrackState`, `SavedPattern`, etc.
- **public/samples/** – Place WAV files here for sample mode.

## Project Structure (Original)

- **index.html** – Single page: billiards table (rack + cue ball), play/pause, SAMPLES/SYNTH toggle, BPM, five sequencer rows, system buttons, signature, social links.
- **style.css** – Layout and styling: green “table” background, ball colors (1–15 pool colors, striped for 9–15, cue ball white), step balls, active-step highlight, toggle switch, track layout.
- **script.js** – All behavior:
  - **Audio**: Creates one `AudioContext`, loads WAVs from `samples/` into buffers, and builds a gain node per track. Also defines synth fallbacks (kick = pitched decay, snare/clap/crash = filtered noise).
  - **Rack**: Renders the triangle of 15 balls from a fixed structure `[[1],[2,3],[4,8,5],...]` plus the cue ball (16), all positioned absolutely.
  - **Sequencer**: One `setInterval` drives `advanceSequencer()` at `60000 / BPM` ms. Current step (1–16) moves the “active” highlight on the rack and on each track and triggers sound for any armed step.
  - **State**: Each track has a 16-slot array (armed on/off). Save/load and “Classic Beats” read/write this plus BPM and volumes.

## Audio Details

- **Samples**: Expected files in `samples/` — `kick_pocket.wav`, `snare_slap.wav`, `hihat_click.wav`, `clap_cuehit.wav`, `crash_break.wav`. If missing, that track stays silent in sample mode.
- **Synth**: Kick = sine drop; snare/clap/crash = generated noise through filters; hi-hat = noise (currently connected to `destination` instead of track gain in the original).
- First sound is triggered on first play (user gesture), which resumes the `AudioContext` if suspended.

## Data Format (Save/Load)

Stored object shape:

- `bpm`: number (slider value).
- `kick`, `snare`, `hihat`, `clap`, `crash`: each `{ state: boolean[] (length 16), vol: string }`.

Default pattern uses a mix of numeric and boolean step data; the UI treats any truthy value as “armed.”

## Credits

Made with real billiards samples by [Jess Chase](https://www.jesschase.com/about). Social links in the footer point to Spotify, Apple Music, TikTok, YouTube, Instagram.
