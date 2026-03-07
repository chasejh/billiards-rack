"use client";

import { useSequencer } from "@/hooks/useSequencer";
import { BilliardsRack } from "@/components/BilliardsRack";
import { SequencerTrack } from "@/components/SequencerTrack";
import { EngineToggle } from "@/components/EngineToggle";
import { BpmControl } from "@/components/BpmControl";
import { PlayPauseButton } from "@/components/PlayPauseButton";
import { SystemControls } from "@/components/SystemControls";
import { TRACK_IDS } from "@/types";

export default function Home() {
  const {
    running,
    currentStep,
    bpm,
    setBpm,
    useSynth,
    setUseSynth,
    trackState,
    trackVol,
    toggleStep,
    clearTrack,
    setVolume,
    playPause,
    randomize,
    savePattern,
    loadPattern,
  } = useSequencer();

  const handleSave = () => {
    savePattern();
    if (typeof window !== "undefined") window.alert("Saved!");
  };

  return (
    <div id="billiards-table" className="flex flex-col items-center w-full max-w-[950px] px-3 sm:px-4 py-6 pb-8">
      <BilliardsRack currentStep={currentStep} />

      <PlayPauseButton running={running} onClick={playPause} />

      <EngineToggle checked={useSynth} onChange={setUseSynth} />

      <BpmControl bpm={bpm} onBpmChange={setBpm} />

      <div className="w-full mt-2">
        {TRACK_IDS.map((trackId) => (
          <SequencerTrack
            key={trackId}
            trackId={trackId}
            state={trackState[trackId]}
            volume={trackVol[trackId]}
            currentStep={currentStep}
            onToggle={(i) => toggleStep(trackId, i)}
            onClear={() => clearTrack(trackId)}
            onVolumeChange={(vol) => setVolume(trackId, vol)}
          />
        ))}
      </div>

      <SystemControls
        onRandom={randomize}
        onSave={handleSave}
        onLoad={loadPattern}
      />
    </div>
  );
}
