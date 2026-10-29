/**
 * v8.20 sideburn · sfx_procedural_cues_v820.js — 未接线可粘贴草稿
 *
 * 目标：用 WebAudio Oscillator（+ 程序化噪声 Buffer，无外部 wav）生成 8 个短 cue，
 *       补雨 / 广播 / 门 / 小游戏手感缺口。风格对齐 public：
 *         - minigames.js snd(type,pan) （triangle + noise pulse）
 *         - index.html playBeep(freq,dur,type,gain)
 *
 * 依赖：浏览器 AudioContext / webkitAudioContext。
 * 勿直接覆盖 public；目录见 ../SFX_CATALOG_v820.md
 *
 * 观测基线（只读 public · 2026-10-29 · VERSION v8.19）：
 *   - snd ids: ok/bad/win/tick/clap/slap/pop
 *   - speakStationPA: 双 sawtooth playBeep（无嘶声）
 *   - useDoor / placeRain: 无 audio
 */

/* ===== 共享 AudioContext（与 snd / playBeep 同思路，独立句柄避免抢锁） ===== */
var PROC_SFX_AC = null;
function procSfxAC() {
  try {
    var AC = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    PROC_SFX_AC = PROC_SFX_AC || new AC();
    if (PROC_SFX_AC.state === 'suspended' && PROC_SFX_AC.resume) {
      try { PROC_SFX_AC.resume(); } catch (_) {}
    }
    return PROC_SFX_AC;
  } catch (_) {
    return null;
  }
}

function procClamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

/** 立体声 pan（可选；无 StereoPanner 则直连） */
function procOut(ac, gainNode, pan) {
  if (ac.createStereoPanner && pan != null && pan !== 0) {
    var p = ac.createStereoPanner();
    p.pan.value = procClamp(pan, -1, 1);
    gainNode.connect(p);
    p.connect(ac.destination);
    return p;
  }
  gainNode.connect(ac.destination);
  return null;
}

/** 程序化白噪 Buffer（秒）；无 fetch / 无 wav */
function procNoiseBuffer(ac, seconds) {
  var n = Math.max(1, Math.floor(ac.sampleRate * seconds));
  var b = ac.createBuffer(1, n, ac.sampleRate);
  var d = b.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

/**
 * 单 Oscillator 短音（对齐 playBeep）
 * @param {object} o {freq,dur,type,gain,slideTo,pan}
 */
function procBeep(o) {
  o = o || {};
  var ac = procSfxAC();
  if (!ac) return false;
  try {
    var t0 = ac.currentTime;
    var dur = o.dur != null ? o.dur : 0.15;
    var g = ac.createGain();
    procOut(ac, g, o.pan);
    var osc = ac.createOscillator();
    osc.type = o.type || 'triangle';
    var f0 = o.freq != null ? o.freq : 440;
    osc.frequency.setValueAtTime(f0, t0);
    if (o.slideTo != null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slideTo), t0 + dur);
    }
    osc.connect(g);
    var amp = o.gain != null ? o.gain : 0.12;
    g.gain.setValueAtTime(amp, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * 噪声脉冲（对齐 snd clap/slap/pop 思路；程序化 Buffer，无 wav）
 * @param {object} o {dur,gain,pan,lpf,q}
 */
function procNoiseBurst(o) {
  o = o || {};
  var ac = procSfxAC();
  if (!ac) return false;
  try {
    var t0 = ac.currentTime;
    var dur = o.dur != null ? o.dur : 0.2;
    var gain = ac.createGain();
    var node = gain;
    if (o.lpf && ac.createBiquadFilter) {
      var bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = o.lpf;
      bp.Q.value = o.q != null ? o.q : 0.85;
      gain.connect(bp);
      node = bp;
    }
    procOut(ac, node, o.pan);
    var src = ac.createBufferSource();
    src.buffer = procNoiseBuffer(ac, dur);
    src.connect(gain);
    var amp = o.gain != null ? o.gain : 0.35;
    gain.gain.setValueAtTime(amp, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
    return true;
  } catch (_) {
    return false;
  }
}

/* ===== 8 个具名短 cue ===== */

/** 雨打铁皮棚 · 短 burst（可循环调用模拟环境） */
function cueRainIron(opts) {
  opts = opts || {};
  var ok = procNoiseBurst({
    dur: opts.dur != null ? opts.dur : 0.45,
    gain: opts.gain != null ? opts.gain : 0.22,
    lpf: 1800,
    q: 0.55,
    pan: opts.pan
  });
  // 轻金属感：叠一条高薄 Osc
  procBeep({
    freq: 2400,
    slideTo: 1600,
    dur: 0.08,
    type: 'triangle',
    gain: 0.03,
    pan: opts.pan
  });
  return ok;
}

/** 雨滴溅落 · 单滴 */
function cueRainDrip(opts) {
  opts = opts || {};
  return procBeep({
    freq: opts.freq != null ? opts.freq : 920,
    slideTo: 280,
    dur: opts.dur != null ? opts.dur : 0.11,
    type: 'sine',
    gain: opts.gain != null ? opts.gain : 0.07,
    pan: opts.pan
  });
}

/** 车站广播「请注意」前缀铃（替代/增强双 saw playBeep） */
function cuePaChime(opts) {
  opts = opts || {};
  var g = opts.gain != null ? opts.gain : 0.045;
  var a = procBeep({
    freq: 280,
    dur: 0.08,
    type: 'sawtooth',
    gain: g,
    pan: opts.pan
  });
  setTimeout(function () {
    procBeep({
      freq: 220,
      dur: 0.12,
      type: 'sawtooth',
      gain: g * 0.85,
      pan: opts.pan
    });
  }, 90);
  return a;
}

/** 广播线路嘶声短促 */
function cuePaHiss(opts) {
  opts = opts || {};
  return procNoiseBurst({
    dur: opts.dur != null ? opts.dur : 0.32,
    gain: opts.gain != null ? opts.gain : 0.12,
    lpf: 3200,
    q: 0.4,
    pan: opts.pan
  });
}

/** 门闩 / 锁舌 */
function cueDoorLatch(opts) {
  opts = opts || {};
  var a = procBeep({
    freq: 1450,
    slideTo: 900,
    dur: 0.05,
    type: 'square',
    gain: opts.gain != null ? opts.gain : 0.06,
    pan: opts.pan
  });
  setTimeout(function () {
    procBeep({
      freq: 160,
      slideTo: 90,
      dur: 0.1,
      type: 'triangle',
      gain: 0.1,
      pan: opts.pan
    });
  }, 35);
  return a;
}

/** 木门沉响 */
function cueDoorWood(opts) {
  opts = opts || {};
  return procBeep({
    freq: opts.freq != null ? opts.freq : 140,
    slideTo: 70,
    dur: opts.dur != null ? opts.dur : 0.26,
    type: 'sine',
    gain: opts.gain != null ? opts.gain : 0.14,
    pan: opts.pan
  });
}

/** 跳房子落地 */
function cueHopLand(opts) {
  opts = opts || {};
  return procBeep({
    freq: opts.freq != null ? opts.freq : 310,
    slideTo: 140,
    dur: opts.dur != null ? opts.dur : 0.13,
    type: 'triangle',
    gain: opts.gain != null ? opts.gain : 0.11,
    pan: opts.pan
  });
}

/** 踢毽子踢中 */
function cueJianziKick(opts) {
  opts = opts || {};
  procNoiseBurst({
    dur: 0.06,
    gain: 0.18,
    lpf: 900,
    q: 1.2,
    pan: opts.pan
  });
  return procBeep({
    freq: opts.freq != null ? opts.freq : 520,
    slideTo: 260,
    dur: opts.dur != null ? opts.dur : 0.12,
    type: 'triangle',
    gain: opts.gain != null ? opts.gain : 0.1,
    pan: opts.pan
  });
}

/** 打牌翻面 / 出牌脆响（可选第 9 感；仍无外部 wav） */
function cueCardSnap(opts) {
  opts = opts || {};
  return procBeep({
    freq: opts.freq != null ? opts.freq : 780,
    slideTo: 420,
    dur: opts.dur != null ? opts.dur : 0.09,
    type: 'square',
    gain: opts.gain != null ? opts.gain : 0.05,
    pan: opts.pan
  });
}

/** 目录：8 个主 cue（card_snap 作别名可选） */
var PROC_SFX_CATALOG = {
  rain_iron: cueRainIron,
  rain_drip: cueRainDrip,
  pa_chime: cuePaChime,
  pa_hiss: cuePaHiss,
  door_latch: cueDoorLatch,
  door_wood: cueDoorWood,
  hop_land: cueHopLand,
  jianzi_kick: cueJianziKick,
  card_snap: cueCardSnap
};

var PROC_SFX_CORE_IDS = [
  'rain_iron',
  'rain_drip',
  'pa_chime',
  'pa_hiss',
  'door_latch',
  'door_wood',
  'hop_land',
  'jianzi_kick'
];

/**
 * 统一入口：playProcCue('pa_chime', {pan:0,gain:...})
 * @returns {boolean}
 */
function playProcCue(id, opts) {
  try { if (typeof window !== "undefined" && (window.__sfxMuted || (typeof localStorage !== "undefined" && localStorage.getItem("dream_v820_sfx") === "0"))) return false; } catch (_) {}
  var fn = PROC_SFX_CATALOG[id];
  if (!fn) return false;
  return !!fn(opts || {});
}

/* UMD / 浏览器粘贴友好导出 */
if (typeof window !== 'undefined') {
  window.PROC_SFX = {
    play: playProcCue,
    catalog: PROC_SFX_CATALOG,
    coreIds: PROC_SFX_CORE_IDS,
    ac: procSfxAC,
    cues: {
      rain_iron: cueRainIron,
      rain_drip: cueRainDrip,
      pa_chime: cuePaChime,
      pa_hiss: cuePaHiss,
      door_latch: cueDoorLatch,
      door_wood: cueDoorWood,
      hop_land: cueHopLand,
      jianzi_kick: cueJianziKick,
      card_snap: cueCardSnap
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    playProcCue: playProcCue,
    PROC_SFX_CATALOG: PROC_SFX_CATALOG,
    PROC_SFX_CORE_IDS: PROC_SFX_CORE_IDS,
    cueRainIron: cueRainIron,
    cueRainDrip: cueRainDrip,
    cuePaChime: cuePaChime,
    cuePaHiss: cuePaHiss,
    cueDoorLatch: cueDoorLatch,
    cueDoorWood: cueDoorWood,
    cueHopLand: cueHopLand,
    cueJianziKick: cueJianziKick,
    cueCardSnap: cueCardSnap
  };
}

/* ===== v8.20 wire adapter: mute + aliases for index.html sfxPlay ===== */
(function (global) {
  var KEY = 'dream_v820_sfx';
  function enabled() {
    try { return localStorage.getItem(KEY) !== '0'; } catch (_) { return true; }
  }
  function setEnabled(on) {
    try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (_) {}
    global.__sfxMuted = !on;
    return on;
  }
  function mapId(id) {
    var m = {
      door: 'door_latch',
      door_wood: 'door_wood',
      pa: 'pa_chime',
      pa_hiss: 'pa_hiss',
      rain_start: 'rain_iron',
      rain: 'rain_iron',
      rain_drip: 'rain_drip',
      rain_stop: null,
      reward: null,
      ui: null,
      hop: 'hop_land',
      jianzi: 'jianzi_kick',
      card: 'card_snap'
    };
    return (id in m) ? m[id] : id;
  }
  var rainOn = false;
  var SFX = {
    muted: !enabled(),
    rainNodes: null,
    last: { id: null, t: 0 },
    enabled: enabled,
    setEnabled: function (on) {
      var r = setEnabled(on);
      this.muted = !on;
      if (!on) { this.rainNodes = null; rainOn = false; }
      return r;
    },
    syncFromStorage: function () {
      var on = enabled();
      this.muted = !on;
      global.__sfxMuted = !on;
      return on;
    },
    beep: function (freq, dur, type, gain) {
      if (this.muted || !enabled()) return null;
      if (global.PROC_SFX && global.PROC_SFX.cues) {
        /* fall through to raw beep via catalog door/pa style */
      }
      try {
        var AC = global.AudioContext || global.webkitAudioContext; if (!AC) return null;
        var ctx = (global.PROC_SFX && global.PROC_SFX.ac && global.PROC_SFX.ac()) || new AC();
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || 'sine'; o.frequency.value = freq || 880;
        g.gain.value = gain || 0.06; o.connect(g); g.connect(ctx.destination);
        var t0 = ctx.currentTime; o.start(t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + (dur || 0.15));
        o.stop(t0 + (dur || 0.15) + 0.02);
        return { id: 'beep', freq: freq };
      } catch (_) { return null; }
    },
    play: function (id, opts) {
      if (this.muted || !enabled()) return null;
      opts = opts || {};
      var now = Date.now();
      if (this.last.id === id && now - this.last.t < (opts.minGap || 80)) return null;
      this.last = { id: id, t: now };
      if (id === 'rain_stop') {
        rainOn = false; this.rainNodes = null;
        return { id: 'rain_stop', t: now };
      }
      if (id === 'reward') {
        this.beep(660, 0.12, 'sine', 0.09);
        var self = this;
        setTimeout(function () { self.beep(990, 0.16, 'triangle', 0.07); }, 90);
        return { id: 'reward', t: now };
      }
      if (id === 'ui') return this.beep(520, 0.07, 'sine', 0.035);
      var mapped = mapId(id);
      if (!mapped) return { id: id, skipped: true };
      try {
        if (global.PROC_SFX && global.PROC_SFX.play) {
          var ok = global.PROC_SFX.play(mapped, opts);
          if (id === 'rain_start' || id === 'rain') { rainOn = true; this.rainNodes = { on: true }; }
          return ok ? { id: id, mapped: mapped, t: now } : null;
        }
      } catch (_) {}
      return null;
    }
  };
  SFX.syncFromStorage();
  global.__sfx = SFX;
  global.__sfxMuted = SFX.muted;
})(typeof window !== 'undefined' ? window : globalThis);
