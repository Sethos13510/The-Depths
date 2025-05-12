// Module de sons basiques générés dynamiquement
// Utilisation : playSound('login_beep', {loop: true, loopCount: 3, id: 'myloop'}), stopSound('myloop')

const BasicSounds = (() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const loops = {};

    // Table de correspondance nom -> fonction de génération
    const soundMap = {
        login_beep: () => beep(880, 0.15),
        data_transfer: () => sequence([ [1040,0.05], [880,0.05], [1200,0.05], [880,0.05] ]),
        error_tone: () => beep(220, 0.3, 'sawtooth'),
        static_burst: () => noise(0.18, 0.3),
        soft_beep: () => beep(660, 0.08, 'sine', 0.2),
        alarm_soft: () => alarm(440, 0.5, 2),
        alarm: () => alarm(660, 0.7, 3),
        system_beep: () => beep(1040, 0.12, 'square'),
        notification: () => beep(1560, 0.09, 'triangle', 0.3),
        warning_beep: () => beep(330, 0.18, 'square', 0.5),
        upload_complete: () => sequence([ [880,0.07], [1040,0.07], [1320,0.12] ]),
        keyboard_typing: () => sequence([ [220,0.03], [330,0.03], [440,0.03] ]),
        lock_click: () => click(),
        relief_sigh: () => sigh(),
        alarm_loud: () => alarm(880, 1, 4),
        power_down: () => powerDown(),
        radio_static: () => noise(0.5, 0.5),
        electrical_surge: () => surge(),
        countdown: () => countdown(),
        system_process: () => sequence([ [660,0.05], [880,0.05], [1040,0.05], [1320,0.05] ]),
        system_failure: () => beep(110, 0.5, 'sawtooth', 0.7),
        whispers: () => whispers(),
        water_splash: () => splash(),
    };

    function beep(freq, duration, type = 'sine', gain = 0.4) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.value = gain;
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + duration);
        o.onended = () => { o.disconnect(); g.disconnect(); };
    }

    function sequence(arr) {
        let t = ctx.currentTime;
        arr.forEach(([freq, dur]) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.value = freq;
            g.gain.value = 0.3;
            o.connect(g).connect(ctx.destination);
            o.start(t);
            o.stop(t + dur);
            o.onended = () => { o.disconnect(); g.disconnect(); };
            t += dur;
        });
    }

    function noise(duration = 0.2, gain = 0.4) {
        const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const n = ctx.createBufferSource();
        n.buffer = buffer;
        const g = ctx.createGain();
        g.gain.value = gain;
        n.connect(g).connect(ctx.destination);
        n.start();
        n.stop(ctx.currentTime + duration);
        n.onended = () => { n.disconnect(); g.disconnect(); };
    }

    function alarm(freq, duration, repeat = 2) {
        let t = ctx.currentTime;
        for (let i = 0; i < repeat; i++) {
            beep(freq, duration / repeat, 'square', 0.5);
            t += duration / repeat;
        }
    }

    function click() {
        noise(0.03, 0.7);
    }

    function sigh() {
        // Descente rapide de fréquence
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(600, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.5);
        g.gain.setValueAtTime(0.3, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.5);
        o.onended = () => { o.disconnect(); g.disconnect(); };
    }

    function powerDown() {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(800, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.7);
        g.gain.setValueAtTime(0.5, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.7);
        o.onended = () => { o.disconnect(); g.disconnect(); };
    }

    function surge() {
        // Montée rapide puis descente
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(200, ctx.currentTime);
        o.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 0.15);
        o.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
        g.gain.setValueAtTime(0.5, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        o.connect(g).connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.4);
        o.onended = () => { o.disconnect(); g.disconnect(); };
    }

    function countdown() {
        let t = ctx.currentTime;
        for (let i = 0; i < 5; i++) {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'square';
            o.frequency.value = 440;
            g.gain.value = 0.4;
            o.connect(g).connect(ctx.destination);
            o.start(t);
            o.stop(t + 0.12);
            o.onended = () => { o.disconnect(); g.disconnect(); };
            t += 0.25;
        }
    }

    function whispers() {
        // Bruit blanc doux, volume faible
        noise(1, 0.08);
    }

    function splash() {
        // Bruit blanc court, puis beep grave
        noise(0.08, 0.5);
        setTimeout(() => beep(180, 0.09, 'sine', 0.2), 60);
    }

    // --- Boucle et contrôle ---
    function playLoop(name, options = {}) {
        let count = 0;
        const max = options.loopCount > 0 ? options.loopCount : Infinity;
        const id = options.id || name;
        loops[id] = true;
        function playNext() {
            if (!loops[id] || count >= max) return;
            count++;
            if (soundMap[name]) soundMap[name]();
            setTimeout(playNext, getSoundDuration(name));
        }
        playNext();
    }
    function stopSound(id) {
        loops[id] = false;
    }
    function getSoundDuration(name) {
        // Durée approximative pour chaque son (en ms)
        const durations = {
            login_beep: 150, data_transfer: 200, error_tone: 300, static_burst: 180, soft_beep: 80, alarm_soft: 500, alarm: 700, system_beep: 120, notification: 90, warning_beep: 180, upload_complete: 260, keyboard_typing: 90, lock_click: 30, relief_sigh: 500, alarm_loud: 1000, power_down: 700, radio_static: 500, electrical_surge: 400, countdown: 1250, system_process: 200, system_failure: 500, whispers: 1000, water_splash: 200
        };
        return durations[name] || 300;
    }

    return {
        playSound: (name, options = {}) => {
            if (options.control === 'stop') {
                stopSound(options.id || name);
                return;
            }
            if (options.loop || options.control === 'start') {
                playLoop(name, options);
            } else if (soundMap[name]) {
                soundMap[name]();
            } else {
                beep(440, 0.1); // fallback
            }
        },
        stopSound
    };
})();

// Fonction globale pour jouer un son
function playSound(name, options) {
    BasicSounds.playSound(name, options);
}
// Fonction globale pour stopper un son
function stopSound(name) {
    BasicSounds.stopSound(name);
} 