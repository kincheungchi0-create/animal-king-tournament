class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isMuted = false;
        this.initialized = false;
        this.oscillatorNodes = [];
        this.bgmTimer = null;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = 0.3; // Default volume 30%

            // Unlock audio on iOS/Chrome
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            this.initialized = true;
            console.log("Audio Synth Initialized");
        } catch (e) {
            console.error("Audio Init Failed:", e);
        }
    }

    play(key, options = {}) {
        if (!this.initialized || this.isMuted) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        switch (key) {
            case 'start':
                this.playTone(440, 'triangle', 0.1, 0.4); // Gong-like
                this.playTone(220, 'sine', 0.1, 0.8);
                break;
            case 'hit_fast':
                this.playNoise(0.05); // Whip/Swipe
                break;
            case 'hit_heavy':
                this.playNoise(0.15); // Heavy punch
                this.playTone(100, 'square', 0, 0.15, -50); // Punch body
                break;
            case 'roar':
                this.playTone(80, 'sawtooth', 0.1, 0.6, -20); // Low growl
                this.playNoise(0.4);
                break;
            case 'win':
                this.playMelody([523, 659, 784, 1046], 0.1, 'square'); // C-E-G-C (Fanfare)
                break;
            case 'ui_click':
                this.playTone(800, 'sine', 0, 0.05);
                break;
            case 'cheer':
                this.playNoise(0.8, 0.05); // Applause simulation (long noise burst)
                break;
        }
    }

    playBGM(key) {
        if (this.bgmTimer) clearInterval(this.bgmTimer);

        // Simple Battle Drum Loop (120 BPM)
        let step = 0;
        this.bgmTimer = setInterval(() => {
            if (this.isMuted || !this.initialized) return;

            // Kick every beat 1
            if (step % 4 === 0) {
                this.playTone(60, 'square', 0, 0.1, -30); // Kick
            }

            // Hi-hat every beat
            this.playNoise(0.02); // Hi-hat

            // Snare beat 2 & 4
            if (step % 4 === 2) {
                this.playNoise(0.08); // Snare
            }

            // Bass line
            if (step % 8 === 0) this.playTone(110, 'sine', 0, 0.2);
            if (step % 8 === 4) this.playTone(82, 'sine', 0, 0.2);

            step++;
        }, 250); // 16th notes at ~120BPM
    }

    stopBGM() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    // --- SYNTHESIZER FUNCTIONS ---

    playTone(freq, type, startTime, duration, slide = 0) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
        if (slide !== 0) {
            osc.frequency.linearRampToValueAtTime(freq + slide, this.ctx.currentTime + startTime + duration);
        }

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

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        // Lowpass filter for 'thud' sound
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
            this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime, 0.1);
        }
        return this.isMuted;
    }
}

// Global Instance
window.audioManager = new SoundManager();
