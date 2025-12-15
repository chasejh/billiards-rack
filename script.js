document.addEventListener('DOMContentLoaded', () => {
    const rackContainer = document.getElementById('rack');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    
    const tracks = {
        kick: { el: document.getElementById('kick-sequencer-track'), clear: document.getElementById('clear-kick-btn'), volEl: document.getElementById('kick-vol'), pads: [], state: Array(16).fill(false), gain: null },
        snare: { el: document.getElementById('snare-sequencer-track'), clear: document.getElementById('clear-snare-btn'), volEl: document.getElementById('snare-vol'), pads: [], state: Array(16).fill(false), gain: null },
        hihat: { el: document.getElementById('hihat-sequencer-track'), clear: document.getElementById('clear-hihat-btn'), volEl: document.getElementById('hihat-vol'), pads: [], state: Array(16).fill(false), gain: null },
        clap: { el: document.getElementById('clap-sequencer-track'), clear: document.getElementById('clear-clap-btn'), volEl: document.getElementById('clap-vol'), pads: [], state: Array(16).fill(false), gain: null },
        crash: { el: document.getElementById('crash-sequencer-track'), clear: document.getElementById('clear-crash-btn'), volEl: document.getElementById('crash-vol'), pads: [], state: Array(16).fill(false), gain: null }
    };

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;
    let sequenceInterval = null;
    let currentStep = 1; 
    let allBalls = []; 
    let tempo = 60000 / parseInt(bpmSlider.value); 

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
            Object.keys(tracks).forEach(key => {
                tracks[key].gain = audioCtx.createGain();
                tracks[key].gain.gain.value = tracks[key].volEl.value;
                tracks[key].gain.connect(audioCtx.destination);
                tracks[key].volEl.addEventListener('input', (e) => {
                    if (tracks[key].gain) tracks[key].gain.gain.value = e.target.value;
                });
            });
        }
    }

    // --- Audio Synthesis Engines ---
    function playKick() {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.connect(g); g.connect(tracks.kick.gain);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        g.gain.setValueAtTime(1, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start(); osc.stop(audioCtx.currentTime + 0.2);
    }

    function playSnare() {
        const now = audioCtx.currentTime;
        const noise = audioCtx.createBufferSource();
        const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.4, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noise.connect(g).connect(tracks.snare.gain);
        noise.start(now);
    }

    function playHiHat() {
        const now = audioCtx.currentTime;
        const noise = audioCtx.createBufferSource();
        const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 8000;
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        noise.connect(filter).connect(g).connect(tracks.hihat.gain);
        noise.start(now);
    }

    function playClap() {
        const now = audioCtx.currentTime;
        const noise = audioCtx.createBufferSource();
        const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;

        const g = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass'; filter.frequency.value = 1200;

        // Triple-trigger effect
        g.gain.setValueAtTime(0.8, now);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.01);
        g.gain.setValueAtTime(0.8, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.035);
        g.gain.setValueAtTime(0.8, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(filter).connect(g).connect(tracks.clap.gain);
        noise.start(now);
    }

    function playCrash() {
        const now = audioCtx.currentTime;
        const noise = audioCtx.createBufferSource();
        const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
        noise.buffer = noiseBuffer;

        const g = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass'; filter.frequency.value = 2500;

        g.gain.setValueAtTime(0.6, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        noise.connect(filter).connect(g).connect(tracks.crash.gain);
        noise.start(now);
    }

    // --- Rack & Track Setup ---
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

    Object.keys(tracks).forEach(key => {
        for (let i = 1; i <= 16; i++) {
            const pad = document.createElement('div');
            pad.className = `step-ball step-ball-${i} ${i >= 9 && i <= 15 ? 'step-ball-striped' : ''}`;
            if (i < 16) pad.textContent = i;
            pad.addEventListener('click', () => {
                tracks[key].state[i-1] = !tracks[key].state[i-1];
                pad.classList.toggle('armed', tracks[key].state[i-1]);
            });
            tracks[key].el.appendChild(pad);
            tracks[key].pads.push(pad);
        }
        tracks[key].clear.addEventListener('click', () => {
            tracks[key].state.fill(false);
            tracks[key].pads.forEach(p => p.classList.remove('armed'));
        });
    });

    // --- Sequencer Logic ---
    function advanceSequencer() {
        const idx = currentStep - 1;
        const prevIdx = (currentStep - 2 + 16) % 16;
        allBalls[prevIdx].classList.remove('active-step');
        Object.values(tracks).forEach(t => {
            t.pads[prevIdx].classList.remove('active-step');
            t.pads[idx].classList.add('active-step');
        });
        allBalls[idx].classList.add('active-step');

        if (tracks.kick.state[idx]) playKick();
        if (tracks.snare.state[idx]) playSnare();
        if (tracks.hihat.state[idx]) playHiHat();
        if (tracks.clap.state[idx]) playClap();
        if (tracks.crash.state[idx]) playCrash();

        currentStep = (currentStep % 16) + 1;
    }

    function toggleSequencer() {
        initAudio();
        if (sequenceInterval) {
            clearInterval(sequenceInterval);
            sequenceInterval = null;
            playPauseBtn.classList.remove('sequencer-running');
            allBalls.forEach(b => b.classList.remove('active-step'));
            Object.values(tracks).forEach(t => t.pads.forEach(p => p.classList.remove('active-step')));
            currentStep = 1;
        } else {
            playPauseBtn.classList.add('sequencer-running');
            sequenceInterval = setInterval(advanceSequencer, tempo);
        }
    }

    playPauseBtn.addEventListener('click', toggleSequencer);
    window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); toggleSequencer(); } });

    bpmSlider.addEventListener('input', (e) => {
        bpmDisplay.textContent = e.target.value;
        tempo = 60000 / e.target.value;
        if (sequenceInterval) {
            clearInterval(sequenceInterval);
            sequenceInterval = setInterval(advanceSequencer, tempo);
        }
    });

    document.getElementById('random-btn').addEventListener('click', () => {
        Object.keys(tracks).forEach(key => {
            tracks[key].state = tracks[key].state.map(() => Math.random() > 0.8);
            tracks[key].pads.forEach((p, i) => p.classList.toggle('armed', tracks[key].state[i]));
        });
    });

    document.getElementById('save-btn').addEventListener('click', () => {
        const data = { bpm: bpmSlider.value };
        Object.keys(tracks).forEach(k => data[k] = tracks[k].state);
        localStorage.setItem('billiardsPatternV9', JSON.stringify(data));
        alert('Saved!');
    });

    document.getElementById('load-btn').addEventListener('click', () => {
        const data = JSON.parse(localStorage.getItem('billiardsPatternV9'));
        if (!data) return;
        bpmSlider.value = data.bpm;
        bpmDisplay.textContent = data.bpm;
        Object.keys(tracks).forEach(k => {
            if (data[k]) {
                tracks[k].state = data[k];
                tracks[k].pads.forEach((p, i) => p.classList.toggle('armed', data[k][i]));
            }
        });
    });
});