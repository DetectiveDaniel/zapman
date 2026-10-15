(() => {
  // Original melodies, generated locally so every world works offline.
  const themes = {
    "Starforge Drift": { bpm: 132, root: 48, wave: "sawtooth", drums: true,
      notes: [12, 19, 15, 22, 19, 15, 12, 10, 12, 19, 24, 22, 19, 15, 10, 7], bass: [0, 0, 8, 10] },
    Meadowbound: { bpm: 78, root: 48, wave: "sine", drums: false,
      notes: [16, null, 19, 21, 19, null, 16, 14, 12, null, 14, 16, 19, null, 16, null], bass: [0, 5, 9, 7] },
    Circuitfall: { bpm: 112, root: 45, wave: "square", drums: true,
      notes: [12, null, 15, 19, 12, 22, null, 19, 10, null, 15, 17, 19, null, 15, 10], bass: [0, 0, 5, 7] },
    "Emberfall Arena": { bpm: 124, root: 38, wave: "triangle", drums: true,
      notes: [12, 12, 15, null, 19, 18, 15, 12, 10, 10, 13, null, 17, 15, 13, 10], bass: [0, 0, 3, 10] },
    "Skyloom Tales": { bpm: 90, root: 50, wave: "triangle", drums: false,
      notes: [12, 16, 19, null, 24, 23, 19, null, 21, 19, 16, 14, 16, null, 12, null], bass: [0, 7, 9, 5] },
    "Neon Tides": { bpm: 120, root: 46, wave: "sine", drums: true,
      notes: [12, null, 19, 22, 24, null, 22, 19, 17, null, 21, 24, 26, 24, 21, 17], bass: [0, 8, 5, 10] },
  };
  const button = document.querySelector("#musicButton");
  const status = document.querySelector("#musicStatus");
  let context = null;
  let output = null;
  let timer = null;
  let revision = 0;
  let active = null;
  let enabled = true;
  let step = 0;
  let nextNote = 0;
  const voices = new Set();

  function stopAudio() {
    revision += 1;
    clearInterval(timer);
    timer = null;
    for (const voice of voices) {
      try { voice.stop(); } catch { /* Already finished. */ }
      voice.disconnect();
    }
    voices.clear();
  }

  function tone(midi, wave, start, duration, volume, endPitch) {
    const voice = context.createOscillator();
    const envelope = context.createGain();
    voice.type = wave;
    voice.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), start);
    if (endPitch) voice.frequency.exponentialRampToValueAtTime(endPitch, start + duration);
    envelope.gain.setValueAtTime(0, start);
    envelope.gain.linearRampToValueAtTime(volume, start + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    voice.connect(envelope);
    envelope.connect(output);
    voices.add(voice);
    voice.onended = () => {
      voices.delete(voice);
      voice.disconnect();
      envelope.disconnect();
    };
    voice.start(start);
    voice.stop(start + duration + 0.01);
  }

  function schedule() {
    if (!active || !enabled || document.hidden || context.state !== "running") return;
    const theme = themes[active];
    const tick = 30 / theme.bpm;
    // Do not replay missed notes after the computer or browser sleeps.
    if (nextNote < context.currentTime) nextNote = context.currentTime + 0.03;
    while (nextNote < context.currentTime + 0.16) {
      const bar = Math.floor(step / 8) % 4;
      const note = theme.notes[step % theme.notes.length];
      if (note !== null) {
        tone(theme.root + note, theme.wave, nextNote, tick * 1.4, 0.1);
      }
      if (step % 2 === 0) {
        tone(theme.root + theme.bass[bar] - 12, "triangle", nextNote, tick * 1.8, 0.15);
      }
      if (!theme.drums && step % 8 === 0) {
        for (const interval of [0, 7, 12]) {
          tone(theme.root + theme.bass[bar] + interval, "sine", nextNote, tick * 7.5, 0.025);
        }
      }
      if (theme.drums) {
        if (step % 4 === 0) tone(43, "sine", nextNote, 0.16, 0.22, 35);
        if (step % 4 === 2) tone(65, "triangle", nextNote, 0.08, 0.06, 110);
        tone(110, "square", nextNote, 0.025, 0.008);
      }
      nextNote += tick;
      step = (step + 1) % 32;
    }
  }

  async function play(name) {
    if (!themes[name]) return;
    stopAudio();
    active = name;
    status.textContent = enabled ? `${name} soundtrack` : "Music is off";
    if (!enabled || document.hidden) return;
    const request = revision;
    try {
      if (!context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          status.textContent = "Music is unavailable in this browser";
          return;
        }
        context = new AudioContextClass();
        output = context.createGain();
        output.gain.value = 0.35;
        output.connect(context.destination);
      }
      // Play and Music On are direct user gestures, satisfying autoplay rules.
      if (context.state !== "running") await context.resume();
      if (request !== revision || !enabled || document.hidden) return;
      if (context.state !== "running") throw new Error("Audio suspended");
      step = 0;
      nextNote = context.currentTime + 0.03;
      schedule();
      timer = setInterval(schedule, 50);
    } catch {
      if (request === revision) status.textContent = "Press Play again to start music";
    }
  }

  function stop() {
    active = null;
    stopAudio();
    status.textContent = "";
  }

  button.addEventListener("click", () => {
    enabled = !enabled;
    button.textContent = enabled ? "Music: On" : "Music: Off";
    button.setAttribute("aria-pressed", String(enabled));
    if (enabled && active) play(active);
    else {
      stopAudio();
      status.textContent = "Music is off";
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAudio();
    else if (active && enabled) play(active);
  });
  window.addEventListener("pagehide", stop);
  window.ImaginecraftMusic = { play, stop };
})();
