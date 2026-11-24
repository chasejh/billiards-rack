# Billiards Master Sequencer

A browser-based drum sequencer built from real (altered) billiards samples, with a synthesized
sound engine as an alternative. It uses plain HTML, CSS, and JavaScript and has
no build step or package dependencies.

[**Kick**](samples/kick_pocket.wav): a ball thumps into the table pocket.

[**Snare**](samples/snare_slap.wav): the cue is dropped on the ground (plus some noise)

[**Hi-Hat**](samples/hihat_click.wav): the click when two balls hit.

[**Clap**](samples/clap_cuehit.wav): when the wood of the cue hits the cue ball because you didn't chalk up.

[**Crash**](samples/crash_break.wav): the first break of the game.


## Run locally

1. Clone or download this repository.
2. From the project root, start a local web server:

   ```sh
   python3 -m http.server 8000
   ```

3. Open <http://localhost:8000> in a  browser.

Serve the files over HTTP rather than opening `index.html` directly; browsers
restrict loading audio samples from `file://` URLs.

## Use the sequencer

- Tap or click the numbered balls in a track to toggle its steps.
- Press the red play button to start or stop playback.
- Adjust the tempo and each track's volume with their sliders.
- Use the Samples/Synth switch to choose the sound source.
- Choose **Classic Beats** to generate a pattern, or save and load a pattern in
  the current browser.

Audio playback starts in response to the play button, as required by mobile
browsers. The sample files are in `samples/`; keep their paths and names intact
when developing.
