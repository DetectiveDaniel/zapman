(() => {
  'use strict';
  const button = document.querySelector('#soundButton');
  const storageKey = 'zapman-browny-city-sound';
  let enabled = true;
  try { enabled = localStorage.getItem(storageKey) !== 'false'; } catch { /* Sound works without storage. */ }
  let context = null, musicBus = null, effectsBus = null, timer = null;
  let scene = 'town', revision = 0, step = 0, nextNote = 0, footTime = 0, hornTime = 0, wasWalk = false;
  const voices = new Map();
  const melody = [12, 16, 19, null, 21, 19, 16, 14, 12, null, 14, 16, 19, 16, 14, null];
  const profiles = { town: [104, 'triangle', 48], home: [80, 'sine', 48], school: [92, 'triangle', 50], arcade: [126, 'square', 48], bank: [90, 'sine', 48], jobs: [100, 'triangle', 48], race: [118, 'triangle', 45], racing: [136, 'square', 45], pizza: [108, 'triangle', 48], shop: [112, 'triangle', 50], garden: [84, 'sine', 48] };
  function label() { button.textContent = enabled ? 'Sound: On' : 'Sound: Off'; button.setAttribute('aria-pressed', String(enabled)); }
  function cancel(bus) {
    for (const [voice, entry] of voices) {
      if (bus && entry.bus !== bus) continue;
      try { voice.stop(); } catch { /* The note has already ended. */ }
      voice.disconnect(); entry.gain.disconnect(); voices.delete(voice);
    }
  }
  function stop() { revision++; clearInterval(timer); timer = null; cancel(); }
  function note(midi, wave, time, duration, volume, bus = 'effects', endFrequency) {
    if (!context || context.state !== 'running' || !enabled || document.hidden || voices.size >= 80) return;
    const voice = context.createOscillator(), gain = context.createGain();
    voice.type = wave; voice.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), time);
    if (endFrequency) voice.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + .008); gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    voice.connect(gain); gain.connect(bus === 'music' ? musicBus : effectsBus);
    voices.set(voice, { gain, bus }); voice.onended = () => { voice.disconnect(); gain.disconnect(); voices.delete(voice); };
    voice.start(time); voice.stop(time + duration + .01);
  }
  function schedule() {
    if (!enabled || document.hidden || context?.state !== 'running' || scene === 'dead') return;
    const [bpm, wave, root] = profiles[scene] || profiles.town, tick = 30 / bpm;
    if (nextNote < context.currentTime) nextNote = context.currentTime + .03;
    while (nextNote < context.currentTime + .16) {
      const chord = [0, 5, 7, 0][Math.floor(step / 8) % 4], pitch = melody[step % 16];
      if (pitch !== null) note(root + pitch, wave, nextNote, tick * 1.5, wave === 'square' ? .07 : .14, 'music');
      if (step % 4 === 0) note(root + chord - 12, 'triangle', nextNote, tick * 3.2, .17, 'music');
      if (step % 8 === 0) for (const interval of [0, 7, 12]) note(root + chord + interval, 'sine', nextNote, tick * 6.5, .035, 'music');
      if (scene === 'racing' && step % 4 === 0) note(43, 'sine', nextNote, .12, .2, 'music', 35);
      nextNote += tick; step = (step + 1) % 32;
    }
  }
  async function unlock() {
    if (!enabled || document.hidden) return;
    const request = revision;
    try {
      if (!context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) { button.disabled = true; button.textContent = 'Sound unavailable'; return; }
        context = new AudioContextClass(); musicBus = context.createGain(); effectsBus = context.createGain();
        musicBus.gain.value = .24; effectsBus.gain.value = .42;
        musicBus.connect(context.destination); effectsBus.connect(context.destination);
      }
      if (context.state !== 'running') await context.resume();
      if (request !== revision || !enabled || document.hidden || context.state !== 'running') return;
      if (timer === null) { nextNote = context.currentTime + .03; schedule(); timer = setInterval(schedule, 50); }
    } catch { button.title = 'Tap Sound or press a movement key to start audio.'; }
  }
  const sounds = {
    door: [[55, .07, 'triangle'], [62, .1, 'triangle']], talk: [[74, .04, 'sine']],
    buy: [[76, .07, 'triangle'], [69, .12, 'triangle']], cash: [[76, .07, 'triangle'], [81, .07, 'triangle'], [88, .15, 'triangle']],
    success: [[72, .08, 'triangle'], [76, .08, 'triangle'], [79, .08, 'triangle'], [84, .2, 'triangle']],
    error: [[55, .08, 'triangle'], [52, .15, 'triangle']], plant: [[67, .06, 'sine'], [79, .12, 'sine']],
    star: [[84, .035, 'sine'], [91, .08, 'sine']], crash: [[43, .14, 'sawtooth'], [36, .22, 'triangle']],
    walk: [[79, .07, 'sine'], [84, .1, 'sine']], horn: [[60, .12, 'triangle'], [64, .15, 'triangle']],
  };
  function effect(name) {
    if (!enabled || document.hidden || context?.state !== 'running') return;
    let offset = .01;
    for (const [midi, length, wave] of sounds[name] || []) { note(midi, wave, context.currentTime + offset, length, name === 'crash' ? .14 : .2); offset += length * .75; }
  }
  function update(dt, state) {
    const wanted = state.dead ? 'dead' : state.racing ? 'racing' : state.room || 'town';
    if (wanted !== scene) { scene = wanted; step = 0; nextNote = (context?.currentTime || 0) + .03; cancel('music'); }
    hornTime = Math.max(0, hornTime - dt);
    if (state.moving && !state.dead && !state.racing) {
      footTime -= dt;
      if (footTime <= 0) { note(43 + step % 2 * 3, 'triangle', (context?.currentTime || 0) + .01, .045, .065); footTime = .27; }
    } else footTime = 0;
    if (state.walk && !wasWalk) effect('walk'); wasWalk = state.walk;
    if (state.traffic && hornTime <= 0 && !state.room && !state.racing) { effect('horn'); hornTime = 4; }
  }
  button.addEventListener('click', () => {
    enabled = !enabled; label();
    try { localStorage.setItem(storageKey, String(enabled)); } catch { /* Keep the choice for this visit. */ }
    if (enabled) unlock(); else stop();
  });
  // Browsers start audio after the first click, tap or key press.
  document.addEventListener('pointerdown', unlock, { capture: true });
  document.addEventListener('keydown', unlock, { capture: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else unlock(); });
  window.addEventListener('pagehide', stop);
  window.BrownyAudio = { effect, update, unlock };
  label();
})();
