/* 鼾声检测器：纯逻辑，无 DOM，可在 node 中测试 */
(function (root) {
  'use strict';
  function pct(arr, p) {
    if (!arr.length) return -120;
    const a = arr.slice().sort((x, y) => x - y);
    return a[Math.min(a.length - 1, Math.floor(p * a.length))];
  }
  function SnoreDetector(opt) {
    opt = opt || {};
    this.sensDb = opt.sensDb != null ? opt.sensDb : 8;   // 超过底噪多少 dB 算鼾
    this.minDur = opt.minDur != null ? opt.minDur : 0.3; // 持续多久才确认
    this.minRatio = opt.minRatio != null ? opt.minRatio : 0.2; // 低频占比
    this.floorWin = opt.floorWin || 30;                  // 底噪窗口（秒）
    this.maxEvent = opt.maxEvent || 5;                    // 单次超过 5s 视为稳态噪音
    this.reset();
  }
  SnoreDetector.prototype.reset = function () {
    this.hists = { 0: [], 1: [] }; this.hist = this.hists[0]; this.t0 = null; this.aboveSince = null; this.belowSince = null;
    this.inEvent = false; this.eventStart = 0; this.count = 0; this.onsets = [];
    this.floorDb = -120; this.levelDb = -120; this.period = 0; this.periodConf = 0; this._lastFloorT = -1;
  };
  /* t 秒；bandPow 60–500Hz 线性功率；totalPow 60–4000Hz；leakBand/leakTotal 为自身噪音预计泄漏功率 */
  /* key：0=噪音低音量，1=噪音高音量。两种状态各自维护底噪，避免自身噪音抬高/压低底噪 */
  SnoreDetector.prototype.update = function (t, bandPow, totalPow, leakBand, leakTotal, key) {
    key = key ? 1 : 0;
    if (key !== this._key) { this._key = key; this._lastFloorT = -1; }
    if (this.t0 == null) this.t0 = t;
    const band = Math.max(bandPow - (leakBand || 0), 1e-13);
    const total = Math.max(totalPow - (leakTotal || 0), band);
    const lvl = 10 * Math.log10(band);
    this.levelDb = lvl;
    let H = this.hists[key];
    if (!(this.inEvent && key === 1)) H.push([t, lvl]); // 高音量时，鼾声段不计入底噪
    for (const k of [0, 1]) { const h = this.hists[k]; const win = k ? 120 : this.floorWin;
      while (h.length && h[0][0] < t - win) h.shift(); }
    if (key === 1 && H.length < 40) H = this.hists[0].length ? this.hists[0] : H; // 高音量样本不足 2 秒时先借用
    this.hist = H;
    if (t - this._lastFloorT >= 0.25) { // 底噪：窗口内 20 百分位
      this.floorDb = pct(H.map(h => h[1]), key ? 0.3 : 0.2); this._lastFloorT = t;
    }
    const warm = (t - this.t0) >= 3;
    const ratio = band / total;
    const above = warm && lvl > this.floorDb + this.sensDb && ratio >= this.minRatio;
    let onset = false, ended = false;
    if (above) {
      this.belowSince = null;
      if (this.aboveSince == null) this.aboveSince = t;
      if (!this.inEvent && t - this.aboveSince >= this.minDur) {
        this.inEvent = true; this.eventStart = this.aboveSince; onset = true; this.count++;
        this.onsets.push(this.aboveSince);
        if (this.onsets.length > 60) this.onsets.shift();
        this._estimatePeriod(t);
      }
      if (this.inEvent && t - this.eventStart > this.maxEvent) {
        // 持续太久不像鼾声（多半是稳态噪音/自身泄漏）：结束事件，并把底噪抬到当前水平
        this.inEvent = false; ended = true; this.aboveSince = null;
        for (let i = 0; i < this.hist.length; i++) this.hist[i][1] = Math.max(this.hist[i][1], lvl - 1);
        this.floorDb = lvl - 1;
        // 这次不算鼾
        this.count = Math.max(0, this.count - 1); this.onsets.pop();
      }
    } else {
      this.aboveSince = null;
      if (this.inEvent) {
        if (this.belowSince == null) this.belowSince = t;
        if (t - this.belowSince >= 0.3) { this.inEvent = false; ended = true; this.belowSince = null; }
      }
    }
    return { active: this.inEvent, onset: onset, ended: ended, levelDb: lvl, floorDb: this.floorDb, ratio: ratio, count: this.count };
  };
  /* 用鼾声起始时刻的冲激序列做自相关，找 2.5–8 s 的周期 */
  SnoreDetector.prototype._estimatePeriod = function (now) {
    const ons = this.onsets.filter(o => o > now - 90);
    if (ons.length < 4) { this.period = 0; this.periodConf = 0; return; }
    const dt = 0.1, start = ons[0], n = Math.ceil((now - start) / dt) + 1;
    const x = new Float32Array(n);
    ons.forEach(o => { const i = Math.round((o - start) / dt);
      for (let k = -3; k <= 3; k++) if (i + k >= 0 && i + k < n) x[i + k] += Math.exp(-(k * k) / 4); });
    let r0 = 0; for (let i = 0; i < n; i++) r0 += x[i] * x[i];
    let best = 0, bestLag = 0;
    for (let lag = Math.round(2.5 / dt); lag <= Math.round(8 / dt) && lag < n; lag++) {
      let s = 0; for (let i = 0; i + lag < n; i++) s += x[i] * x[i + lag];
      if (s > best) { best = s; bestLag = lag; }
    }
    const conf = r0 > 0 ? best / r0 : 0;
    // 用该周期附近的相邻间隔中位数细化
    const iv = []; for (let i = 1; i < ons.length; i++) { const d = ons[i] - ons[i - 1]; if (Math.abs(d - bestLag * dt) < 0.25 * bestLag * dt) iv.push(d); }
    this.periodConf = conf;
    this.period = (conf >= 0.4 && iv.length >= 2) ? pct(iv, 0.5) : 0;
  };
  /* 预计下一声开始时刻；没有可靠周期则返回 null */
  SnoreDetector.prototype.nextExpected = function (now) {
    if (!this.period || !this.onsets.length) return null;
    const last = this.onsets[this.onsets.length - 1];
    if (now - last > this.period * 3) return null; // 停打了
    let nx = last + this.period; while (nx < now - 0.2) nx += this.period;
    return nx;
  };
  root.SnoreDetector = SnoreDetector;
  if (typeof module !== 'undefined') module.exports = SnoreDetector;
})(typeof window !== 'undefined' ? window : globalThis);
