class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.initialized = false;

        // External Audio Buffers
        this.buffers = {};
        this.sources = {};

        // Define paths for High Quality OpenGameArt Assets
        this.assets = {
            'bgm': 'audio/battle_theme.ogg',
            'win': 'audio/win_fanfare.wav',
            'cheer': 'audio/crowd_cheer.wav',
            'roar': 'audio/roar.wav',
            'hit_heavy': 'audio/hit_heavy.wav'
        };
    }

    async init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.4;

            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }

            this.initialized = true;
            console.log("Hybrid Audio Engine Initialized");

            // Attempt to load external assets in background
            this.loadAssets();

        } catch (e) {
            console.error("Audio Init Failed:", e);
        }
    }

    async loadAssets() {
        for (const [key, url] of Object.entries(this.assets)) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
                this.buffers[key] = audioBuffer;
                console.log(`Loaded audio asset: ${key}`);
            } catch (e) {
                console.warn(`Failed to load ${key}, will use fallback Synth.`, e);
            }
        }
    }

    play(key, options = {}) {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // 1. Try to play external buffer first (High Quality)
        if (this.buffers[key]) {
            this.playBuffer(key, options);
            return;
        }

        // 2. Fallback to Synth (Procedural)
        this.playSynth(key);
    }

    playBuffer(key, options) {
        try {
            const source = this.ctx.createBufferSource();
            source.buffer = this.buffers[key];

            const gain = this.ctx.createGain();
            gain.gain.value = options.volume !== undefined ? options.volume : 1.0;

            if (options.loop) source.loop = true;

            source.connect(gain);
            gain.connect(this.masterGain);
            source.start(0);

            // Store reference for stopping later (BGM)
            if (options.loop) {
                if (this.sources[key]) this.sources[key].stop();
                this.sources[key] = source;
            }
        } catch (e) {
            console.error("Buffer Play Error", e);
        }
    }

    playBGM(key) {
        // Stop any existing BGM (Synth or Buffer)
        this.stopBGM();

        // 1. Try HQ Buffer
        if (this.buffers['bgm']) {
            this.play('bgm', { loop: true, volume: 0.6 });
            return;
        }

        // 2. Fallback to Drum Loop Synth
        this.startSynthBGM();
    }

    stopBGM() {
        // Stop Buffer
        if (this.sources['bgm']) {
            this.sources['bgm'].stop();
            this.sources['bgm'] = null;
        }
        // Stop Synth Timer
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    // --- SYNTH FALLBACKS (Zero-Latency, Always Works) ---

    playSynth(key) {
        switch (key) {
            case 'start':
                this.playTone(440, 'triangle', 0.1, 0.4);
                this.playTone(220, 'sine', 0.1, 0.8);
                break;
            case 'hit_fast':
                this.playNoise(0.05);
                break;
            case 'hit_heavy':
                this.playNoise(0.15);
                this.playTone(100, 'square', 0, 0.15, -50);
                break;
            case 'roar':
                this.playTone(80, 'sawtooth', 0.1, 0.6, -20);
                this.playNoise(0.4);
                break;
            case 'win':
                this.playMelody([523, 659, 784, 1046], 0.1, 'square');
                break;
            case 'ui_click':
                this.playTone(800, 'sine', 0, 0.05);
                break;
            case 'cheer':
                this.playNoise(0.8, 0.05);
                break;
        }
    }

    startSynthBGM() {
        let step = 0;
        this.bgmTimer = setInterval(() => {
            if (this.isMuted || !this.initialized) return;
            if (step % 4 === 0) this.playTone(60, 'square', 0, 0.1, -30); // Kick
            this.playNoise(0.02); // Hi-hat
            if (step % 4 === 2) this.playNoise(0.08); // Snare
            if (step % 8 === 0) this.playTone(110, 'sine', 0, 0.2); // Bass
            step++;
        }, 250);
    }

    // Synth Utilities
    playTone(freq, type, startTime, duration, slide = 0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
        if (slide !== 0) osc.frequency.linearRampToValueAtTime(freq + slide, this.ctx.currentTime + startTime + duration);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(this.ctx.currentTime + startTime);
        osc.stop(this.ctx.currentTime + startTime + duration);
    }

    playNoise(duration, vol = 0.2) {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start();
    }

    playMelody(notes, noteLength, type) {
        notes.forEach((freq, index) => {
            this.playTone(freq, type, index * noteLength, noteLength);
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    }
}

window.audioManager = new SoundManager();
