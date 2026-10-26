(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const S = { // 设置
    noise: 'brown', base: 20, max: 65, sens: 6, hold: 9, pred: true, ec: true, timer: 0
  };
  try { Object.assign(S, JSON.parse(localStorage.getItem('snoreCfg') || '{}')); } catch (e) {}
  const save = () => { try { localStorage.setItem('snoreCfg', JSON.stringify(S)); } catch (e) {} };

  let ctx, stream, src, analyser, noiseSrc, noiseGain, buffers = {}, timerId, wakeLock;
  let running = false, det = new SnoreDetector(), g = 0, gHist = [];
  let leakK = 0, leakKT = 0, calib = null, lastSnoreEnd = -1e9, stopAt = 0, fadeOutStart = 0;
  const tl = []; let tlCur = null; // 时间线：每秒一个点
  const amp = p => Math.pow(p / 100, 2); // 滑块 → 线性幅度
  const msg = t => { $('msg').textContent = t || ''; };
  const W = window; W.__snore = { det: det, errors: [] };
  W.addEventListener('error', e => W.__snore.errors.push(String(e.message)));

  /* ---------- 噪音生成：可无缝循环 ---------- */
  function makeNoise(type, sr) {
    const L = Math.floor(sr * 8), F = Math.floor(sr * 0.5);
    const buf = ctx.createBuffer(2, L, sr);
    for (let ch = 0; ch < 2; ch++) {
      const a = new Float32Array(L + F);
      let b = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < a.length; i++) {
        const w = Math.random() * 2 - 1;
        if (type === 'brown') { b = (b + 0.02 * w) / 1.02; a[i] = b; }
        else { b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
          b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
          a[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362; b6 = w * 0.115926; }
      }
      // 去直流
      let m = 0; for (let i = 0; i < a.length; i++) m += a[i]; m /= a.length;
      const out = buf.getChannelData(ch);
      for (let i = 0; i < L; i++) out[i] = a[i] - m;
      for (let i = 0; i < F; i++) { const x = i / F, fi = Math.sin(x * Math.PI / 2), fo = Math.cos(x * Math.PI / 2);
        out[i] = (a[i] - m) * fi + (a[L + i] - m) * fo; } // 尾部交叉淡入开头 → 循环无接缝
      let rms = 0; for (let i = 0; i < L; i++) rms += out[i] * out[i]; rms = Math.sqrt(rms / L);
      const k = 0.18 / rms; for (let i = 0; i < L; i++) out[i] = Math.max(-1, Math.min(1, out[i] * k));
    }
    return buf;
  }
  function playNoise() {
    if (noiseSrc) { try { noiseSrc.stop(); } catch (e) {} noiseSrc.disconnect(); }
    if (!buffers[S.noise]) buffers[S.noise] = makeNoise(S.noise, ctx.sampleRate);
    noiseSrc = ctx.createBufferSource(); noiseSrc.buffer = buffers[S.noise]; noiseSrc.loop = true;
    noiseSrc.connect(noiseGain); noiseSrc.start();
  }

  /* ---------- 开始 / 停止 ---------- */
  async function start() {
    msg('正在请求麦克风……');
    try {
      if (navigator.audioSession) { try { navigator.audioSession.type = 'play-and-record'; } catch (e) {} }
      stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: S.ec, noiseSuppression: false, autoGainControl: false, channelCount: 1 } });
    } catch (e) { msg('拿不到麦克风：' + e.name + '。请在浏览器设置里允许麦克风，并确认是 https 打开。'); return; }
    ctx = ctx || new (W.AudioContext || W.webkitAudioContext)();
    if (ctx.state !== 'running') await ctx.resume();
    src = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser(); analyser.fftSize = 4096; analyser.smoothingTimeConstant = 0;
    const sink = ctx.createGain(); sink.gain.value = 0;
    src.connect(analyser); analyser.connect(sink); sink.connect(ctx.destination);
    noiseGain = noiseGain || ctx.createGain(); noiseGain.gain.value = 0; noiseGain.connect(ctx.destination);
    playNoise();
    det = new SnoreDetector({ sensDb: 14 - S.sens }); W.__snore.det = det;
    g = 0; running = true; lastSnoreEnd = -1e9;
    stopAt = S.timer ? now() + S.timer * 60 : 0; fadeOutStart = 0;
    startCalib();
    timerId = setInterval(tick, 50);
    requestWake();
    $('start').textContent = '停止'; $('start').classList.add('on');
    msg('已开始。保持屏幕常亮、插上充电器。');
  }
  function stop(reason) {
    running = false; clearInterval(timerId);
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (noiseGain) noiseGain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    setTimeout(() => { if (!running && noiseSrc) { try { noiseSrc.stop(); } catch (e) {} noiseSrc = null; } }, 1500);
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    $('start').textContent = '开始'; $('start').classList.remove('on');
    $('state').textContent = '已停止'; $('ind').classList.remove('on');
    msg(reason || '');
  }
  const now = () => ctx ? ctx.currentTime : performance.now() / 1000;

  async function requestWake() {
    try { if ('wakeLock' in navigator) { wakeLock = await navigator.wakeLock.request('screen'); } }
    catch (e) { msg('无法自动保持亮屏，请在系统设置里把自动锁屏调长。'); }
  }
  document.addEventListener('visibilitychange', () => {
    if (running && document.visibilityState === 'visible') { requestWake(); if (ctx.state !== 'running') ctx.resume(); }
  });

  /* ---------- 校准：静听 2s → 最大音量 2s，估算自身喇叭泄漏 ---------- */
  function startCalib() { calib = { t0: now() + 0.5, quiet: [], quietT: [], loud: [], loudT: [] }; }

  /* ---------- 每 50ms 一次 ---------- */
  const fbuf = new Float32Array(2048);
  function bandPowers() {
    analyser.getFloatFrequencyData(fbuf);
    const hz = ctx.sampleRate / analyser.fftSize;
    const i0 = Math.ceil(60 / hz), i1 = Math.floor(500 / hz), i2 = Math.min(fbuf.length - 1, Math.floor(4000 / hz));
    let b = 0, t = 0;
    for (let i = i0; i <= i2; i++) { const p = Math.pow(10, fbuf[i] / 10); if (!isFinite(p)) continue; t += p; if (i <= i1) b += p; }
    return [b, t];
  }
  const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : 0; };

  function tick() {
    const t = now();
    const [band, total] = bandPowers();
    const lo = amp(S.base), hi = Math.max(lo, amp(S.max));
    let target, rampUp = (hi - lo) / 0.5 || 1, rampDown = (hi - lo) / 5 || 0.2;

    if (calib) { // 校准阶段
      const dt = t - calib.t0;
      if (dt < 0) target = 0;
      else if (dt < 2) { target = 0; calib.quiet.push(band); calib.quietT.push(total); }
      else if (dt < 2.4) target = hi;          // 等声音到稳
      else if (dt < 4.4) { target = hi; calib.loud.push(band); calib.loudT.push(total); }
      else {
        const gg = hi * hi || 1e-6;
        leakK = Math.max(0, med(calib.loud) - med(calib.quiet)) / gg;
        leakKT = Math.max(0, med(calib.loudT) - med(calib.quietT)) / gg;
        calib = null; det.reset(); target = lo;
        msg('校准完成。' + (leakK > 0 ? '' : '（几乎没检测到喇叭漏音）'));
      }
      g = target; noiseGain.gain.setTargetAtTime(g, ctx.currentTime, 0.05);
      gHist.push([t, g]);
      $('state').textContent = '校准中'; draw(null); return;
    }

    // 约 150ms 前的音量才是此刻漏进麦克风的
    gHist.push([t, g]); while (gHist.length > 1 && gHist[1][0] <= t - 0.15) gHist.shift();
    const gPast = gHist[0][1];
    const leakB = leakK * gPast * gPast * 1.2, leakT = leakKT * gPast * gPast * 1.2;
    det.sensDb = 14 - S.sens;
    const r = det.update(t, band, total, leakB, leakT, gPast > (lo + hi) / 2 + 1e-9 && hi > lo * 1.5);
    if (r.active || r.ended) lastSnoreEnd = t;

    let hold = S.hold;
    const nx = S.pred ? det.nextExpected(t) : null;
    if (nx && det.period) hold = Math.min(hold, det.period + 1.5);
    const want = r.active || (t - lastSnoreEnd < hold) || (nx != null && nx - t < 0.6 && nx - t > -0.8);
    target = want ? hi : lo;

    // 定时关闭：最后 15 秒淡出
    if (stopAt && t > stopAt - 15) { target = lo * Math.max(0, (stopAt - t) / 15); if (t >= stopAt) { stop('定时到了，已停止。'); return; } }

    const dt = 0.05;
    if (g < target) g = Math.min(target, g + rampUp * dt); else if (g > target) g = Math.max(target, g - rampDown * dt);
    noiseGain.gain.setTargetAtTime(g, ctx.currentTime, 0.03);

    W.__snore.last = { t: t, r: r, g: g, leakK: leakK, period: det.period, ticks: (W.__snore.last ? W.__snore.last.ticks : 0) + 1 };
    $('state').textContent = r.active ? '打鼾中' : (want ? '保持' : '安静');
    $('ind').classList.toggle('on', r.active);
    $('count').textContent = det.count; $('dimTxt').textContent = det.count + ' 次';
    $('vol').textContent = Math.round(Math.sqrt(g) * 100) + '%';
    $('period').textContent = det.period ? ('周期：' + det.period.toFixed(1) + ' 秒') : '周期：–';
    $('db').textContent = '低频 ' + r.levelDb.toFixed(0) + ' dB / 底噪 ' + r.floorDb.toFixed(0);
    // 时间线
    const sec = Math.floor(t);
    if (!tlCur || tlCur.s !== sec) { if (tlCur) tl.push(tlCur); while (tl.length > 300) tl.shift();
      tlCur = { s: sec, lvl: r.levelDb, floor: r.floorDb, g: g, sn: r.active }; }
    else { tlCur.lvl = Math.max(tlCur.lvl, r.levelDb); tlCur.g = Math.max(tlCur.g, g); tlCur.sn = tlCur.sn || r.active; tlCur.floor = r.floorDb; }
    draw(r);
  }

  /* ---------- 画图 ---------- */
  function fit(c) { const w = c.clientWidth * (W.devicePixelRatio || 1); if (c.width !== w) { c.width = w; c.height = c.getAttribute('height') * (W.devicePixelRatio || 1); } }
  function draw(r) {
    const m = $('meter'); fit(m); const x = m.getContext('2d'); x.clearRect(0, 0, m.width, m.height);
    if (r) {
      const lo = r.floorDb - 15, hi = r.floorDb + 35, f = v => Math.max(0, Math.min(1, (v - lo) / (hi - lo))) * m.width;
      x.fillStyle = r.active ? '#c8553d' : '#6b5a3e'; x.fillRect(0, m.height * 0.2, f(r.levelDb), m.height * 0.6);
      x.fillStyle = '#fff'; x.fillRect(f(r.floorDb) - 1, 0, 2, m.height);
      x.fillStyle = '#e0a25a'; x.fillRect(f(r.floorDb + det.sensDb) - 1, 0, 3, m.height);
    }
    const c = $('tl'); fit(c); const y = c.getContext('2d'); y.clearRect(0, 0, c.width, c.height);
    const pts = tlCur ? tl.concat([tlCur]) : tl; if (!pts.length) return;
    const H = c.height, bw = c.width / 300, off = 300 - pts.length;
    pts.forEach((p, i) => {
      const X = (off + i) * bw;
      const rel = Math.max(0, Math.min(1, (p.lvl - p.floor + 5) / 40));
      y.fillStyle = p.sn ? '#c8553d' : '#3a3428'; y.fillRect(X, H - rel * H * 0.9, Math.max(1, bw), rel * H * 0.9);
    });
    y.strokeStyle = '#e0a25a'; y.lineWidth = 2 * (W.devicePixelRatio || 1); y.beginPath();
    pts.forEach((p, i) => { const X = (off + i + 0.5) * bw, Y = H - Math.sqrt(p.g) * H * 0.95; i ? y.lineTo(X, Y) : y.moveTo(X, Y); });
    y.stroke();
  }

  /* ---------- 控件 ---------- */
  function bind(id, key, fmt) {
    const el = $(id); el.value = S[key];
    const show = () => { $(id + 'V').textContent = fmt ? fmt(+el.value) : el.value; };
    el.addEventListener('input', () => { S[key] = +el.value; show(); save(); }); show();
  }
  bind('base', 'base', v => v + '%'); bind('max', 'max', v => v + '%'); bind('sens', 'sens'); bind('hold', 'hold');
  $('pred').checked = S.pred; $('pred').onchange = e => { S.pred = e.target.checked; save(); };
  $('ec').checked = S.ec; $('ec').onchange = e => { S.ec = e.target.checked; save(); if (running) msg('回声消除改动将在下次“开始”时生效。'); };
  $('timer').value = S.timer; $('timer').onchange = e => { S.timer = +e.target.value; save(); if (running) stopAt = S.timer ? now() + S.timer * 60 : 0; };
  document.querySelectorAll('.seg button').forEach(b => {
    b.classList.toggle('sel', b.dataset.n === S.noise);
    b.onclick = () => { S.noise = b.dataset.n; save(); document.querySelectorAll('.seg button').forEach(x => x.classList.toggle('sel', x === b)); if (running) playNoise(); };
  });
  $('start').onclick = () => running ? stop('已停止。') : start().catch(e => { msg('出错：' + e.message); W.__snore.errors.push(String(e)); });
  $('recal').onclick = () => { if (running) { startCalib(); msg('重新校准中……'); } };
  $('dark').onclick = () => { $('dim').style.display = 'flex'; };
  $('dim').onclick = () => { $('dim').style.display = 'none'; };
  if (!W.isSecureContext) msg('注意：需要用 https 打开，否则无法使用麦克风。');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) msg('这个浏览器不支持麦克风，请换 Chrome / Safari / 华为浏览器。');
})();
