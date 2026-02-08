class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sounds = {};
        this.isMuted = false;

        // Define sound paths
        this.library = {
            'bgm_drum': 'audio/battle_theme.ogg',
            'cheer': 'audio/crowd_cheer.ogg',
            'roar': 'audio/roar.ogg',
            'hit_heavy': 'audio/hit_heavy.ogg',
            'hit_fast': 'audio/hit_fast.ogg',
            'win': 'audio/win_fanfare.ogg',
            'start': 'audio/gong.ogg',
            'click': 'audio/ui_click.ogg'
        };

        this.buffers = {};
        this.initialized = false;
    }

    // Call this on user interaction (Start Button)
    async init() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.5; // Start at 50% volume

            // Allow auto-play resume
            if (this.ctx.state === 'suspended') {
                await this.ctx.resume();
            }

            await this.loadAllSounds();
            this.initialized = true;
            console.log("Audio Initialized");

        } catch (e) {
            console.error("Audio Init Failed:", e);
        }
    }

    async loadAllSounds() {
        const promises = Object.entries(this.library).map(([key, url]) => this.loadSound(key, url));
        await Promise.all(promises);
    }

    async loadSound(key, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.buffers[key] = audioBuffer;
        } catch (e) {
            console.warn(`Failed to load sound: ${key} (${url})`, e);
            // Fallback: Synthesize a beep? Or just silent fail.
        }
    }

    play(key, options = {}) {
        if (!this.initialized || this.isMuted || !this.buffers[key]) return;

        try {
            // Resume context if suspended (browser auto-block)
            if (this.ctx.state === 'suspended') this.ctx.resume();

            const source = this.ctx.createBufferSource();
            source.buffer = this.buffers[key];

            const gainNode = this.ctx.createGain();

            // Random pitch variation for variety (except BGM)
            if (!options.loop) {
                const detune = (Math.random() * 200) - 100; // +/- 100 cents
                source.detune.value = detune;
            } else {
                source.loop = true;
            }

            // Volume control
            const volume = options.volume !== undefined ? options.volume : 1.0;
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(this.masterGain);

            source.start(0);

            return { source, gainNode }; // Return control nodes if needed (e.g. to stop BGM)
        } catch (e) {
            console.error("Play Sound Error:", e);
        }
    }

    playBGM(key) {
        if (this.currentBGM) {
            this.currentBGM.source.stop();
        }
        this.currentBGM = this.play(key, { loop: true, volume: 0.6 });
    }

    stopBGM() {
        if (this.currentBGM) {
            this.currentBGM.source.stop();
            this.currentBGM = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    }
}

// Global Instance
window.audioManager = new SoundManager();
