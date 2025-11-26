// Servicio de sonidos y feedback
class SoundService {
    constructor() {
        this.audioContext = null;
        this.settings = { enabled: true, volume: 0.5 };
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('AudioContext no disponible');
        }
    }

    playBeep(frequency = 800, duration = 100) {
        if (!this.settings.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.settings.volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    playSuccess() {
        this.playBeep(800, 150);
        setTimeout(() => this.playBeep(1000, 150), 100);
    }

    playError() {
        this.playBeep(400, 200);
    }

    playScan() {
        this.playBeep(1200, 50);
    }

    playSale() {
        this.playBeep(600, 100);
        setTimeout(() => this.playBeep(800, 100), 50);
        setTimeout(() => this.playBeep(1000, 150), 100);
    }

    setSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }
}

export const soundService = new SoundService();
soundService.init();
