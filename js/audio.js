(function () {
  "use strict";
  const CVVH = window.CVVH = window.CVVH || {};
  let context = null;
  let enabled = true;

  function ensureContext() {
    if (!enabled) return null;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      if (!context) context = new AudioContext();
      if (context.state === "suspended") context.resume().catch(function () {});
      return context;
    } catch (error) { return null; }
  }

  function tone(frequency, duration, type, volume, delay) {
    const ctx = ensureContext();
    if (!ctx) return;
    try {
      const start = ctx.currentTime + (delay || 0);
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type || "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume || 0.06, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
    } catch (error) { /* Audio feedback is non-blocking. */ }
  }

  function play(name) {
    if (!enabled) return;
    const patterns = {
      click: [[420,.06,"triangle",.035,0]],
      arrival: [[300,.09,"sine",.045,0],[430,.1,"sine",.04,.08]],
      fry: [[115,.12,"square",.025,0],[145,.09,"square",.02,.05]],
      ready: [[620,.1,"sine",.055,0],[820,.15,"sine",.05,.09]],
      success: [[520,.1,"triangle",.06,0],[680,.1,"triangle",.06,.08],[880,.18,"triangle",.055,.16]],
      error: [[210,.13,"sawtooth",.045,0],[145,.2,"sawtooth",.04,.1]],
      coin: [[780,.07,"sine",.05,0],[1030,.12,"sine",.045,.06]],
      upgrade: [[440,.09,"triangle",.05,0],[660,.1,"triangle",.05,.08],[920,.18,"sine",.045,.17]]
    };
    (patterns[name] || patterns.click).forEach(function (item) { tone.apply(null, item); });
  }

  function setEnabled(value) { enabled = value !== false; }
  function isEnabled() { return enabled; }
  CVVH.Audio = { play: play, setEnabled: setEnabled, isEnabled: isEnabled };
})();
