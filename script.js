document.addEventListener('DOMContentLoaded', () => {
    const rackContainer = document.getElementById('rack');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmInput = document.getElementById('bpm-input');
    const engineToggle = document.getElementById('engine-toggle');
    const exportBtn = document.getElementById('export-btn');
    
    const tracks = {
        kick: { el: document.getElementById('kick-sequencer-track'), clear: document.getElementById('clear-kick-btn'), volEl: document.getElementById('kick-vol'), pads: [], state: Array(16).fill(false), gain: null, buffer: null },
        snare: { el: document.getElementById('snare-sequencer-track'), clear: document.getElementById('clear-snare-btn'), volEl: document.getElementById('snare-vol'), pads: [], state: Array(16).fill(false), gain: null, buffer: null },
        hihat: { el: document.getElementById('hihat-sequencer-track'), clear: document.getElementById('clear-hihat-btn'), volEl: document.getElementById('hihat-vol'), pads: [], state: Array(16).fill(false), gain: null, buffer: null },
        clap: { el: document.getElementById('clap-sequencer-track'), clear: document.getElementById('clear-clap-btn'), volEl: document.getElementById('clap-vol'), pads: [], state: Array(16).fill(false), gain: null, buffer: null },
        crash: { el: document.getElementById('crash-sequencer-track'), clear: document.getElementById('clear-crash-btn'), volEl: document.getElementById('crash-vol'), pads: [], state: Array(16).fill(false), gain: null, buffer: null }
    };

    const sampleMap = {
        kick: 'samples/kick_pocket.wav',
        snare: 'samples/snare_slap.wav',
        hihat: 'samples/hihat_click.wav',
        clap: 'samples/clap_cuehit.wav',
        crash: 'samples/crash_break.wav'
    };

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    let sequenceInterval = null;
    let audioStarting = false;
    let currentStep = 1; 
    let allBalls = []; 
    let tempo = 60000 / 250 / 4;

    function setBpm(value, preserveInput = false) {
        const parsedBpm = Number(value);
        const bpm = Number.isFinite(parsedBpm)
            ? Math.min(Number(bpmSlider.max), Math.max(Number(bpmSlider.min), Math.round(parsedBpm)))
            : Number(bpmSlider.value);
        bpmSlider.value = bpm;
        if (!preserveInput) bpmInput.value = bpm;
        tempo = 60000 / bpm / 4;
        if (sequenceInterval) {
            clearInterval(sequenceInterval);
            sequenceInterval = setInterval(advanceSequencer, tempo);
        }
    }

    // --- Sample Loading Logic ---
    async function loadSample(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Sample request failed (${response.status}): ${url}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return await audioCtx.decodeAudioData(arrayBuffer);
    }

    async function initAudio() {
        if (!AudioContext) {
            throw new Error('Web Audio API is not supported in this browser.');
        }

        if (navigator.audioSession) {
            navigator.audioSession.type = 'playback';
        }

        if (!audioCtx) {
            audioCtx = new AudioContext();
            Object.keys(tracks).forEach((key) => {
                tracks[key].gain = audioCtx.createGain();
                tracks[key].gain.gain.value = tracks[key].volEl.value;
                tracks[key].gain.connect(audioCtx.destination);

                tracks[key].volEl.addEventListener('input', (e) => {
                    if (tracks[key].gain) tracks[key].gain.gain.value = e.target.value;
                });
            });
        }

        if (audioCtx.state !== 'running') {
            const silentBuffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
            const unlockSource = audioCtx.createBufferSource();
            unlockSource.buffer = silentBuffer;
            unlockSource.connect(audioCtx.destination);
            unlockSource.start(0);
            await audioCtx.resume();
        }

        await Promise.all(Object.keys(tracks).map(async (key) => {
            if (!tracks[key].buffer) {
                try {
                    tracks[key].buffer = await loadSample(sampleMap[key]);
                } catch (error) {
                    console.error(`Failed to load sample for ${key}.`, error);
                }
            }
        }));
    }

    function playSample(key) {
        if (!tracks[key].buffer) return;
        const source = audioCtx.createBufferSource();
        source.buffer = tracks[key].buffer;
        source.connect(tracks[key].gain);
        source.start(0);
    }

    // --- Audio Synthesis Engines (The fallback) ---
    function playKickSynth(context = audioCtx, destination = tracks.kick.gain, when = context.currentTime) {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain); gain.connect(destination);
        osc.frequency.setValueAtTime(150, when);
        osc.frequency.exponentialRampToValueAtTime(0.01, when + 0.15);
        gain.gain.setValueAtTime(1, when);
        gain.gain.exponentialRampToValueAtTime(0.001, when + 0.2);
        osc.start(when); osc.stop(when + 0.2);
    }

    function playSnareSynth(context = audioCtx, destination = tracks.snare.gain, when = context.currentTime) {
        const now = when;
        const noise = context.createBufferSource();
        const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.1), context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;
        const g = context.createGain();
        g.gain.setValueAtTime(0.4, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noise.connect(g).connect(destination);
        noise.start(now);
    }

    function playHiHatSynth(context = audioCtx, destination = tracks.hihat.gain, when = context.currentTime) {
        const now = when;
        const noise = context.createBufferSource();
        const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.05), context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;
        const filter = context.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 8000;
        const g = context.createGain();
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        noise.connect(filter).connect(g).connect(destination);
        noise.start(now);
    }

    function playClapSynth(context = audioCtx, destination = tracks.clap.gain, when = context.currentTime) {
        const now = when;
        const noise = context.createBufferSource();
        const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.1), context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;
        const filter = context.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 1000;
        const g = context.createGain();
        g.gain.setValueAtTime(0.5, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noise.connect(filter).connect(g).connect(destination);
        noise.start(now);
    }

    function playCrashSynth(context = audioCtx, destination = tracks.crash.gain, when = context.currentTime) {
        const now = when;
        const noise = context.createBufferSource();
        const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 1.5), context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;
        const filter = context.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 3000;
        const g = context.createGain();
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        noise.connect(filter).connect(g).connect(destination);
        noise.start(now);
    }

    // --- Master Trigger ---
    function triggerSound(key) {
        if (engineToggle.checked) {
            if (key === 'kick') playKickSynth();
            if (key === 'snare') playSnareSynth();
            if (key === 'hihat') playHiHatSynth();
            if (key === 'clap') playClapSynth();
            if (key === 'crash') playCrashSynth();
        } else {
            playSample(key);
        }
    }

    const synthEngines = {
        kick: playKickSynth,
        snare: playSnareSynth,
        hihat: playHiHatSynth,
        clap: playClapSynth,
        crash: playCrashSynth
    };

    function encodeWav(audioBuffer) {
        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const frameCount = audioBuffer.length;
        const bytesPerSample = 2;
        const dataSize = frameCount * channels * bytesPerSample;
        const buffer = new ArrayBuffer(44 + dataSize);
        const view = new DataView(buffer);
        const writeText = (offset, text) => {
            for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
        };

        writeText(0, 'RIFF');
        view.setUint32(4, 36 + dataSize, true);
        writeText(8, 'WAVE');
        writeText(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * channels * bytesPerSample, true);
        view.setUint16(32, channels * bytesPerSample, true);
        view.setUint16(34, bytesPerSample * 8, true);
        writeText(36, 'data');
        view.setUint32(40, dataSize, true);

        const channelData = Array.from({ length: channels }, (_, channel) => audioBuffer.getChannelData(channel));
        let offset = 44;
        for (let frame = 0; frame < frameCount; frame++) {
            for (let channel = 0; channel < channels; channel++) {
                const sample = Math.max(-1, Math.min(1, channelData[channel][frame]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
                offset += bytesPerSample;
            }
        }
        return new Blob([buffer], { type: 'audio/wav' });
    }

    exportBtn.addEventListener('click', async () => {
        exportBtn.disabled = true;
        const originalText = exportBtn.textContent;
        exportBtn.textContent = 'Rendering...';
        try {
            await initAudio();
            const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            if (!OfflineContext) {
                throw new Error('WAV export is not supported in this browser.');
            }

            const bpm = Number(bpmInput.value);
            const stepDuration = 60 / bpm / 4;
            const barDuration = stepDuration * 16;
            const pattern = Object.fromEntries(Object.keys(tracks).map((key) => [
                key,
                {
                    state: tracks[key].state.slice(),
                    volume: Number(tracks[key].volEl.value)
                }
            ]));
            const useSynth = engineToggle.checked;
            if (!useSynth) {
                const missingSample = Object.keys(tracks).find((key) =>
                    pattern[key].state.some(Boolean) && !tracks[key].buffer
                );
                if (missingSample) {
                    throw new Error(`The ${missingSample} sample could not be loaded.`);
                }
            }

            const longestSample = useSynth ? 0 : Math.max(
                0,
                ...Object.keys(tracks).map((key) => tracks[key].buffer?.duration || 0)
            );
            const tailDuration = Math.max(2, longestSample);
            const sampleRate = audioCtx.sampleRate;
            const frameCount = Math.ceil((barDuration + tailDuration) * sampleRate);
            const offlineContext = new OfflineContext(2, frameCount, sampleRate);
            const destinations = {};
            Object.keys(tracks).forEach((key) => {
                destinations[key] = offlineContext.createGain();
                destinations[key].gain.value = pattern[key].volume;
                destinations[key].connect(offlineContext.destination);
            });

            Object.keys(tracks).forEach((key) => {
                pattern[key].state.forEach((isArmed, step) => {
                    if (!isArmed) return;
                    const when = step * stepDuration;
                    if (useSynth) {
                        synthEngines[key](offlineContext, destinations[key], when);
                    } else {
                        const source = offlineContext.createBufferSource();
                        source.buffer = tracks[key].buffer;
                        source.connect(destinations[key]);
                        source.start(when);
                    }
                });
            });

            const renderedBuffer = await offlineContext.startRendering();
            const wav = encodeWav(renderedBuffer);
            const downloadUrl = URL.createObjectURL(wav);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `billiards-beat-${bpm}bpm-jesschase.wav`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        } catch (error) {
            console.error('Unable to export WAV.', error);
            alert(`Unable to export WAV: ${error.message}`);
        } finally {
            exportBtn.disabled = false;
            exportBtn.textContent = originalText;
        }
    });

    // --- Rack Generation ---
    const rackStructure = [[1], [2, 3], [4, 8, 5], [6, 7, 9, 10], [11, 12, 13, 14, 15]];
    let rowY = 0;
    rackStructure.forEach((row) => {
        const startX = (200 - (row.length * 36)) / 2;
        row.forEach((num, i) => {
            const ball = document.createElement('div');
            ball.className = `ball ball-${num} ${num >= 9 ? 'striped' : ''}`;
            ball.textContent = num;
            ball.style.left = `${startX + (i * 36)}px`;
            ball.style.top = `${rowY}px`;
            ball.dataset.num = num;
            rackContainer.appendChild(ball);
            allBalls.push(ball);
        });
        rowY += 36;
    });

    const cueBall = document.querySelector('.cue-ball');
    allBalls.push(cueBall);
    allBalls.sort((a, b) => (parseInt(a.dataset.num || 16)) - (parseInt(b.dataset.num || 16)));

    // --- Track Setup ---
    Object.keys(tracks).forEach(key => {
        for (let i = 1; i <= 16; i++) {
            const pad = document.createElement('div');
            pad.className = `step-ball step-ball-${i} ${i >= 9 && i <= 15 ? 'step-ball-striped' : ''}`;
            if (i < 16) pad.textContent = i;
            pad.addEventListener('click', () => {
                const idx = i - 1;
                tracks[key].state[idx] = !tracks[key].state[idx];
                pad.classList.toggle('armed', tracks[key].state[idx]);
            });
            tracks[key].el.appendChild(pad);
            tracks[key].pads.push(pad);
        }
        tracks[key].clear.addEventListener('click', () => {
            tracks[key].state.fill(false);
            tracks[key].pads.forEach(p => p.classList.remove('armed'));
        });
    });

    // --- Engine ---
    function advanceSequencer() {
        const idx = currentStep - 1;
        const prevIdx = (currentStep - 2 + 16) % 16;
        allBalls[prevIdx].classList.remove('active-step');
        Object.values(tracks).forEach(t => {
            t.pads[prevIdx].classList.remove('active-step');
            t.pads[idx].classList.add('active-step');
        });
        allBalls[idx].classList.add('active-step');

        if (tracks.kick.state[idx]) triggerSound('kick');
        if (tracks.snare.state[idx]) triggerSound('snare');
        if (tracks.hihat.state[idx]) triggerSound('hihat');
        if (tracks.clap.state[idx]) triggerSound('clap');
        if (tracks.crash.state[idx]) triggerSound('crash');

        currentStep = (currentStep % 16) + 1;
    }

    playPauseBtn.addEventListener('click', async () => {
        if (sequenceInterval) {
            clearInterval(sequenceInterval);
            sequenceInterval = null;
            playPauseBtn.classList.remove('sequencer-running');
            allBalls.forEach(b => b.classList.remove('active-step'));
            Object.values(tracks).forEach(t => t.pads.forEach(p => p.classList.remove('active-step')));
            currentStep = 1;
            return;
        }

        if (audioStarting) return;
        audioStarting = true;
        try {
            await initAudio();
            playPauseBtn.classList.add('sequencer-running');
            advanceSequencer();
            sequenceInterval = setInterval(advanceSequencer, tempo);
        } catch (error) {
            console.error('Unable to start audio playback.', error);
        } finally {
            audioStarting = false;
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            playPauseBtn.click();
        }
    });

    bpmSlider.addEventListener('input', () => setBpm(bpmSlider.value));
    bpmInput.addEventListener('input', () => {
        if (bpmInput.value !== '' && bpmInput.validity.valid) setBpm(bpmInput.value, true);
    });
    bpmInput.addEventListener('change', () => {
        setBpm(bpmInput.value === '' ? bpmSlider.value : bpmInput.value);
    });
    bpmInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') bpmInput.blur();
    });

    document.getElementById('random-btn').addEventListener('click', () => {
        Object.keys(tracks).forEach(key => {
            tracks[key].state = tracks[key].state.map(() => Math.random() > 0.85);
            tracks[key].pads.forEach((p, i) => p.classList.toggle('armed', tracks[key].state[i]));
        });
    });

    document.getElementById('save-btn').addEventListener('click', () => {
        const data = {
            bpm: bpmInput.value,
            kick: { state: tracks.kick.state, vol: tracks.kick.volEl.value },
            snare: { state: tracks.snare.state, vol: tracks.snare.volEl.value },
            hihat: { state: tracks.hihat.state, vol: tracks.hihat.volEl.value },
            clap: { state: tracks.clap.state, vol: tracks.clap.volEl.value },
            crash: { state: tracks.crash.state, vol: tracks.crash.volEl.value }
        };
        localStorage.setItem('billiardsPatternFinal', JSON.stringify(data));
        alert('Saved!');
    });

    document.getElementById('load-btn').addEventListener('click', () => {
        const data = JSON.parse(localStorage.getItem('billiardsPatternFinal'));
        if (!data) return;
        setBpm(data.bpm);
        Object.keys(tracks).forEach(key => {
            if (data[key]) {
                tracks[key].state = data[key].state;
                tracks[key].volEl.value = data[key].vol;
                if (tracks[key].gain) tracks[key].gain.gain.value = data[key].vol;
                tracks[key].pads.forEach((p, i) => p.classList.toggle('armed', tracks[key].state[i]));
            }
        });
    });

    // --- Default Pattern ---
    function applyPattern(data) {
        setBpm(data.bpm || bpmSlider.value);
        Object.keys(tracks).forEach(key => {
            if (Array.isArray(data[key])) {
                tracks[key].state = data[key].slice();
                tracks[key].pads.forEach((p, i) => p.classList.toggle('armed', tracks[key].state[i]));
            } else if (data[key] && Array.isArray(data[key].state)) {
                tracks[key].state = data[key].state.slice();
                tracks[key].pads.forEach((p, i) => p.classList.toggle('armed', tracks[key].state[i]));
                if (data[key].vol !== undefined) {
                    tracks[key].volEl.value = data[key].vol;
                    if (tracks[key].gain) tracks[key].gain.gain.value = data[key].vol;
                }
            }
        });
    }

    const defaultPattern = {
        bpm: 120,
        kick: [1,0,3,0,0,0,7,8,0,10,0,0,0,14,0,0],
        snare: [0,0,0,0,5,0,0,0,0,0,0,12,0,0,15,16],
        hihat: [0,2,0,4,0,6,0,0,9,0,11,0,13,0,0,16],
        clap: Array.from({ length: 16 }, (_, i) => [5,12].includes(i)),
        crash: Array.from({ length: 16 }, (_, i) => [0,10].includes(i)),
    };

    // Apply default on first load only if no saved pattern exists
    if (!localStorage.getItem('billiardsPatternFinal')) {
        applyPattern(defaultPattern);
    } else {
        const savedPattern = JSON.parse(localStorage.getItem('billiardsPatternFinal'));
        setBpm(savedPattern.bpm || bpmSlider.value);
    }
});