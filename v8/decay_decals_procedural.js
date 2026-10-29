/**
 * v8.19 sideburn · decay_decals_procedural.js — v8.19 已接线
 *
 * 目标：在任意 THREE.Group 上撒「锈斑 / 煤灰 / 水渍」Plane 贴花（色值 + roughness），
 *       程序化、零外部贴图依赖（不 fetch / 不引用整面材质缓存 / 无 GLB）。
 *
 * 依赖：全局 THREE（与 index.html 一致）。
 * 勿直接覆盖 public；正式接线见 ../DECAY_DECALS_WIRING_v819.md
 *
 * 观测基线（只读 public · 2026-10-29 · VERSION v8.18）：
 *   - 枢纽 nosplat 地面：Circle dirt + coal 圆盘 y=0.01（~L624–630）
 *   - 车站 pack：煤灰 ground + 木站台 + 锈柱（~L401–429）
 *   - 门框：makeEntranceFacade → DOOR_VIS 挂载（~L1430 / ~L2390）
 *   - 已有整面 rust/coal Canvas map；本片段是「点状贴花叠加」，互补不替代
 */

/* ===== 调色板（破败脏污 · 冷灰矿区） ===== */
var DECAY_PALETTE = {
  rust: [
    { color: 0x8a4a28, roughness: 0.92, metalness: 0.22, opacity: 0.78 },
    { color: 0x6e3a1c, roughness: 0.95, metalness: 0.18, opacity: 0.72 },
    { color: 0xa05a30, roughness: 0.88, metalness: 0.28, opacity: 0.65 }
  ],
  soot: [
    { color: 0x2a2622, roughness: 1.00, metalness: 0.02, opacity: 0.70 },
    { color: 0x3a342e, roughness: 0.98, metalness: 0.02, opacity: 0.55 },
    { color: 0x1a1816, roughness: 1.00, metalness: 0.00, opacity: 0.62 }
  ],
  stain: [
    { color: 0x4a5a58, roughness: 0.55, metalness: 0.05, opacity: 0.48 },
    { color: 0x3a4846, roughness: 0.62, metalness: 0.04, opacity: 0.42 },
    { color: 0x5a6860, roughness: 0.50, metalness: 0.06, opacity: 0.38 }
  ]
};

/** 简易可复现 RNG（seed 可选；默认随 Math.random） */
function decayRng(seed) {
  if (seed == null || seed !== seed) {
    return function () { return Math.random(); };
  }
  var s = (seed >>> 0) || 1;
  return function () {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * 单片贴花 Mesh（Plane · 半透明 Standard · 贴地/贴墙）
 * @param {'rust'|'soot'|'stain'} kind
 * @param {object} [opts] size, seed, R
 */
function makeDecayDecal(kind, opts) {
  opts = opts || {};
  var R = opts.R || decayRng(opts.seed);
  var pal = DECAY_PALETTE[kind] || DECAY_PALETTE.soot;
  var p = pal[(R() * pal.length) | 0];
  var sx = (opts.size || 0.45) * (0.55 + R() * 0.9);
  var sz = sx * (0.6 + R() * 0.8);
  var mat = new THREE.MeshStandardMaterial({
    color: p.color,
    roughness: p.roughness,
    metalness: p.metalness,
    transparent: true,
    opacity: p.opacity * (0.85 + R() * 0.2),
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1
  });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), mat);
  mesh.name = 'decay_' + kind;
  mesh.userData.decayKind = kind;
  mesh.renderOrder = 2;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  return mesh;
}

/**
 * 在 Group 上水平撒贴花（贴地：rotation.x = -PI/2）
 * @param {THREE.Group} group
 * @param {object} [opts]
 *   count   {number} 默认 18
 *   radius  {number} 水平散布半径，默认 6
 *   kinds   {string[]} 默认 ['rust','soot','stain']
 *   y       {number} 贴花高度（略抬离地面防 z-fight），默认 0.012
 *   cx,cz   {number} 圆心偏移，默认 0
 *   seed    {number} 可选
 *   mix     {object} 种类权重，如 {rust:0.35,soot:0.4,stain:0.25}
 * @returns {THREE.Group} 贴花子 Group（已 add 到 group）
 */
function scatterDecayDecals(group, opts) {
  opts = opts || {};
  var count = opts.count != null ? opts.count | 0 : 18;
  var radius = opts.radius != null ? +opts.radius : 6;
  var kinds = opts.kinds || ['rust', 'soot', 'stain'];
  var y = opts.y != null ? +opts.y : 0.012;
  var cx = opts.cx || 0;
  var cz = opts.cz || 0;
  var R = decayRng(opts.seed);
  var mix = opts.mix || null;
  var bag = new THREE.Group();
  bag.name = 'decay_decals';
  bag.userData.decayDraft = true;
  bag.userData.wired = true;

  function pickKind() {
    if (!mix) return kinds[(R() * kinds.length) | 0];
    var t = R(), acc = 0;
    for (var i = 0; i < kinds.length; i++) {
      acc += mix[kinds[i]] != null ? mix[kinds[i]] : 1 / kinds.length;
      if (t <= acc) return kinds[i];
    }
    return kinds[kinds.length - 1];
  }

  for (var i = 0; i < count; i++) {
    var kind = pickKind();
    var ang = R() * Math.PI * 2;
    var rad = Math.sqrt(R()) * radius; // 更均匀的圆盘分布
    var m = makeDecayDecal(kind, { R: R, size: opts.size });
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = R() * Math.PI * 2;
    m.position.set(cx + Math.cos(ang) * rad, y, cz + Math.sin(ang) * rad);
    bag.add(m);
  }
  group.add(bag);
  return bag;
}

/**
 * 沿竖直门框/立柱撒锈斑+水渍（贴墙：默认朝 +Z，可用 yaw 转）
 * @param {THREE.Group} group
 * @param {object} [opts]
 *   count, radius（水平半宽）, height（竖直跨度，默认 2.6）
 *   cx, cy0, cz · yaw · seed · size
 */
function scatterDecayOnDoorFrame(group, opts) {
  opts = opts || {};
  var count = opts.count != null ? opts.count | 0 : 10;
  var halfW = opts.radius != null ? +opts.radius : 0.55;
  var height = opts.height != null ? +opts.height : 2.6;
  var cx = opts.cx || 0;
  var cy0 = opts.cy0 != null ? +opts.cy0 : 0.15;
  var cz = opts.cz != null ? +opts.cz : 0.06;
  var yaw = opts.yaw || 0;
  var R = decayRng(opts.seed);
  var bag = new THREE.Group();
  bag.name = 'decay_doorframe';
  bag.userData.decayDraft = true;
  bag.position.set(cx, 0, 0);
  bag.rotation.y = yaw;

  for (var i = 0; i < count; i++) {
    var kind = R() < 0.55 ? 'rust' : (R() < 0.5 ? 'stain' : 'soot');
    var m = makeDecayDecal(kind, { R: R, size: (opts.size || 0.28) });
    // 贴墙：Plane 默认朝 +Z；略抬 cz 防穿模
    var side = R() < 0.5 ? -1 : 1;
    m.position.set(side * (halfW * (0.7 + R() * 0.35)), cy0 + R() * height, cz);
    m.rotation.z = (R() - 0.5) * 0.6;
    bag.add(m);
  }
  // 门槛水渍一条（水平）
  var sillN = Math.max(2, (count / 4) | 0);
  for (var j = 0; j < sillN; j++) {
    var s = makeDecayDecal('stain', { R: R, size: 0.35 });
    s.rotation.x = -Math.PI / 2;
    s.position.set((R() - 0.5) * halfW * 1.6, 0.01, cz + 0.15 + R() * 0.25);
    bag.add(s);
  }
  group.add(bag);
  return bag;
}

/**
 * 一键配方：枢纽广场地面
 * scatterDecayDecals(hubRoot, DECAY_PRESETS.hubFloor)
 */
var DECAY_PRESETS = {
  hubFloor: {
    count: 28,
    radius: 9,
    y: 0.014,
    mix: { rust: 0.25, soot: 0.45, stain: 0.30 },
    size: 0.55,
    seed: 81901
  },
  stationPlatform: {
    count: 22,
    radius: 7,
    cx: 0,
    cz: 2.2,
    y: 0.46, // 站台面≈0.4 + 抬升
    mix: { rust: 0.30, soot: 0.50, stain: 0.20 },
    size: 0.42,
    seed: 81902
  },
  stationFloor: {
    count: 16,
    radius: 8,
    y: 0.012,
    mix: { rust: 0.20, soot: 0.55, stain: 0.25 },
    size: 0.5,
    seed: 81903
  },
  doorFrame: {
    count: 12,
    radius: 0.6,
    height: 2.5,
    cy0: 0.2,
    cz: 0.08,
    size: 0.26,
    seed: 81904
  }
};

/**
 * 便捷：按预设名挂到 Group
 * applyDecayPreset(group, 'hubFloor')
 * applyDecayPreset(doorGroup, 'doorFrame')  // 走门框路径
 */
function applyDecayPreset(group, name, override) {
  var base = DECAY_PRESETS[name];
  if (!base) throw new Error('unknown decay preset: ' + name);
  var o = {};
  for (var k in base) if (Object.prototype.hasOwnProperty.call(base, k)) o[k] = base[k];
  if (override) for (var k2 in override) if (Object.prototype.hasOwnProperty.call(override, k2)) o[k2] = override[k2];
  if (name === 'doorFrame') return scatterDecayOnDoorFrame(group, o);
  return scatterDecayDecals(group, o);
}

/* 导出（浏览器粘贴时挂 window；模块环境可忽略） */
if (typeof window !== 'undefined') {
  window.DECAY_PALETTE = DECAY_PALETTE;
  window.DECAY_PRESETS = DECAY_PRESETS;
  window.makeDecayDecal = makeDecayDecal;
  window.scatterDecayDecals = scatterDecayDecals;
  window.scatterDecayOnDoorFrame = scatterDecayOnDoorFrame;
  window.applyDecayPreset = applyDecayPreset;
  window.decayRng = decayRng;
}

/* eslint 友好：node --check 可解析；运行需 THREE */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DECAY_PALETTE: DECAY_PALETTE,
    DECAY_PRESETS: DECAY_PRESETS,
    makeDecayDecal: makeDecayDecal,
    scatterDecayDecals: scatterDecayDecals,
    scatterDecayOnDoorFrame: scatterDecayOnDoorFrame,
    applyDecayPreset: applyDecayPreset,
    decayRng: decayRng
  };
}
