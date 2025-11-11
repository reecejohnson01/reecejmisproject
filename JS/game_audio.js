// Replace generator with external audio player using audio/audio.mp3
(function(){
    let audioEl = null;
    let wasPlayingBeforeHidden = false;

    function setup() {
        const btn = document.getElementById('audioToggle');
        if(!btn) return;

        audioEl = new Audio('audio/audio.mp3');
        audioEl.loop = true;
        audioEl.preload = 'auto';
        audioEl.volume = 0.6;

        btn.textContent = 'Play Music';

        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!audioEl) return;
            if (audioEl.paused) {
                await audioEl.play().catch(() => {});
                btn.textContent = 'Mute Music';
            } else {
                audioEl.pause();
                btn.textContent = 'Play Music';
            }
        });

        // start on first gesture optionally
        document.addEventListener('click', async function startOnce() {
            if (audioEl && audioEl.paused) {
                await audioEl.play().catch(() => {});
                btn.textContent = 'Mute Music';
            }
            document.removeEventListener('click', startOnce);
        }, { once: true });

        // visibility handling: pause when hidden, resume if it was playing
        document.addEventListener('visibilitychange', () => {
            if (!audioEl) return;
            if (document.hidden) {
                wasPlayingBeforeHidden = !audioEl.paused;
                if (!audioEl.paused) audioEl.pause();
            } else {
                if (wasPlayingBeforeHidden) audioEl.play().catch(() => {});
            }
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
    else setup();

    window.__gameAudioPlayer = {
        play: () => audioEl && audioEl.play().catch(()=>{}),
        pause: () => audioEl && audioEl.pause(),
        isPlaying: () => audioEl && !audioEl.paused
    };
})();
