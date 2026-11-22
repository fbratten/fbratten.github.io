/* Ljud som syntetiseras i webbläsaren med Web Audio. Inga ljudfiler.
   Bakgrund: vind (kyla), hav (kust/oceaner), drönare och en varm ackordmatta (holocen).
   Händelser: olika klangfärger per typ av belägg. Startas först efter en användarhandling. */
(function (FA) {
  "use strict";
  var SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25];

  function Audio() { this.ctx = null; this.enabled = true; this.volume = 0.7; }

  // ctx: valfri färdig kontext (t.ex. OfflineAudioContext för filmens ljudspår)
  Audio.prototype.init = function (given) {
    if (this.ctx) { if (this.ctx.state === "suspended" && this.ctx.resume) this.ctx.resume(); return true; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!given && !AC) return false;
    var ctx = this.ctx = given || new AC();
    this.master = ctx.createGain(); this.master.gain.value = 0;
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    this.master.connect(comp); comp.connect(ctx.destination);

    // efterklang från genererat impulssvar
    var len = Math.floor(ctx.sampleRate * 2.8), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = ir.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    this.verb = ctx.createConvolver(); this.verb.buffer = ir;
    this.verbGain = ctx.createGain(); this.verbGain.gain.value = 0.35;
    this.verb.connect(this.verbGain); this.verbGain.connect(this.master);

    var nb = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), nd = nb.getChannelData(0), last = 0;
    for (var k = 0; k < nd.length; k++) { var w = Math.random() * 2 - 1; last = (last + 0.04 * w) / 1.04; nd[k] = last * 3.2; }
    this.noise = nb;

    // vind
    var wind = ctx.createBufferSource(); wind.buffer = nb; wind.loop = true;
    var bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 0.9;
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
    var lfoG = ctx.createGain(); lfoG.gain.value = 260; lfo.connect(lfoG); lfoG.connect(bp.frequency);
    this.windGain = ctx.createGain(); this.windGain.gain.value = 0;
    wind.connect(bp); bp.connect(this.windGain); this.windGain.connect(this.master);
    wind.start(); lfo.start();

    // hav
    var sea = ctx.createBufferSource(); sea.buffer = nb; sea.loop = true; sea.playbackRate.value = 0.7;
    var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    var swell = ctx.createGain(); swell.gain.value = 0.55;
    var wav = ctx.createOscillator(); wav.frequency.value = 0.11;
    var wavG = ctx.createGain(); wavG.gain.value = 0.45; wav.connect(wavG); wavG.connect(swell.gain);
    this.seaGain = ctx.createGain(); this.seaGain.gain.value = 0;
    sea.connect(lp); lp.connect(swell); swell.connect(this.seaGain); this.seaGain.connect(this.master);
    sea.start(); wav.start();

    // drönare
    this.droneGain = ctx.createGain(); this.droneGain.gain.value = 0;
    var dlp = ctx.createBiquadFilter(); dlp.type = "lowpass"; dlp.frequency.value = 380;
    [55, 82.41, 110.3].forEach(function (f, i) {
      var o = ctx.createOscillator(); o.type = i === 2 ? "triangle" : "sine"; o.frequency.value = f;
      var g = ctx.createGain(); g.gain.value = i === 2 ? 0.35 : 0.6;
      o.connect(g); g.connect(dlp); o.start();
    });
    dlp.connect(this.droneGain); this.droneGain.connect(this.master);

    // varm matta
    this.padGain = ctx.createGain(); this.padGain.gain.value = 0;
    var plp = ctx.createBiquadFilter(); plp.type = "lowpass"; plp.frequency.value = 900;
    [220, 261.63, 329.63, 392, 493.88].forEach(function (f, i) {
      var o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = f; o.detune.value = (i % 2 ? 4 : -4);
      var g = ctx.createGain(); g.gain.value = 0.14;
      o.connect(g); g.connect(plp); o.start();
    });
    plp.connect(this.padGain); this.padGain.connect(this.master); this.padGain.connect(this.verb);
    this.setEnabled(this.enabled);
    return true;
  };

  Audio.prototype.setEnabled = function (on) {
    this.enabled = on;
    if (!this.ctx) return;
    var t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? this.volume : 0, t, 0.4);
  };

  // glacial 0..1, ocean 0..1, playing bool
  Audio.prototype.update = function (glacial, ocean, playing, when) {
    if (!this.ctx || !this.enabled) return;
    var t = when != null ? when : this.ctx.currentTime, k = playing ? 1 : 0.55;
    this.windGain.gain.setTargetAtTime((0.04 + 0.2 * glacial) * k, t, 1.2);
    this.seaGain.gain.setTargetAtTime((0.03 + 0.22 * ocean) * k, t, 1.2);
    this.droneGain.gain.setTargetAtTime((0.05 + 0.07 * glacial) * k, t, 1.5);
    this.padGain.gain.setTargetAtTime(0.05 * (1 - glacial) * k, t, 2.0);
  };

  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }

  Audio.prototype.chime = function (kind, status, idx, when) {
    if (!this.ctx || !this.enabled) return;
    var ctx = this.ctx, t = (when != null ? when : ctx.currentTime) + 0.02;
    var f = SCALE[Math.abs(idx || 0) % SCALE.length];
    var out = ctx.createGain(); out.gain.value = status === "omstritt" ? 0.55 : 0.8;
    out.connect(this.master); out.connect(this.verb);
    var nodes = [];
    function osc(type, freq) { var o = ctx.createOscillator(); o.type = type; o.frequency.value = freq; nodes.push(o); return o; }
    if (status === "omstritt" || status === "antytt") {
      var vib = osc("sine", status === "omstritt" ? 6 : 4);
      var vg = ctx.createGain(); vg.gain.value = f * (status === "omstritt" ? 0.012 : 0.005);
      vib.connect(vg); this._vib = vg;
    }
    var vibG = this._vib; this._vib = null;
    function hook(o) { if (vibG) vibG.connect(o.frequency); }
    if (kind === "genetik") {
      var car = osc("sine", f * 2), mod = osc("sine", f * 2 * 3.5), mg = ctx.createGain(), g1 = ctx.createGain();
      mg.gain.setValueAtTime(f * 3, t); mg.gain.exponentialRampToValueAtTime(1, t + 1.6);
      mod.connect(mg); mg.connect(car.frequency); car.connect(g1); g1.connect(out); hook(car);
      env(g1, t, 0.01, 0.22, 2.4);
    } else if (kind === "miljo") {
      var s = ctx.createBufferSource(); s.buffer = this.noise; nodes.push(s);
      var bpf = ctx.createBiquadFilter(); bpf.type = "lowpass"; bpf.frequency.setValueAtTime(300, t); bpf.frequency.linearRampToValueAtTime(1200, t + 1.2);
      var g2 = ctx.createGain(); s.connect(bpf); bpf.connect(g2); g2.connect(out); env(g2, t, 0.5, 0.25, 1.6);
      var lo = osc("sine", f / 2), g3 = ctx.createGain(); lo.connect(g3); g3.connect(out); env(g3, t, 0.4, 0.18, 1.8);
    } else if (kind === "kontakt") {
      var lpf = ctx.createBiquadFilter(); lpf.type = "lowpass"; lpf.frequency.setValueAtTime(1800, t); lpf.frequency.exponentialRampToValueAtTime(400, t + 1.3);
      [1, 1.5].forEach(function (r) {
        var o = osc("sawtooth", f * r / 2); hook(o);
        var g = ctx.createGain(); o.connect(g); g.connect(lpf); env(g, t, 0.06, 0.09, 1.4);
      });
      lpf.connect(out);
    } else {
      var o1 = osc("sine", f), o2 = osc("sine", f * 3.93), ga = ctx.createGain(), gb = ctx.createGain();
      hook(o1); o1.connect(ga); o2.connect(gb); ga.connect(out); gb.connect(out);
      env(ga, t, 0.005, 0.3, 0.9); env(gb, t, 0.003, 0.08, 0.22);
    }
    nodes.forEach(function (n) { n.start(t); n.stop(t + 3.2); });
  };

  Audio.prototype.whoosh = function (when) {
    if (!this.ctx || !this.enabled) return;
    var ctx = this.ctx, t = (when != null ? when : ctx.currentTime) + 0.02;
    var s = ctx.createBufferSource(); s.buffer = this.noise;
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 1.2;
    f.frequency.setValueAtTime(200, t); f.frequency.exponentialRampToValueAtTime(2200, t + 1.1); f.frequency.exponentialRampToValueAtTime(500, t + 2.2);
    var g = ctx.createGain(); s.connect(f); f.connect(g); g.connect(this.master); g.connect(this.verb);
    env(g, t, 0.6, 0.22, 1.6);
    s.start(t); s.stop(t + 2.5);
  };

  FA.Audio = Audio;
})(window.FA = window.FA || {});
