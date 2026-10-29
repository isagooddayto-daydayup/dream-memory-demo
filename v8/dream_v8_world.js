/** Dream v8.13 world helpers (魂系气质: fog/camera/cold light): physical entrances (doors / storefronts / cave mouths / station mine carts), char cards. No paid APIs. */
export const VERSION = 'v8.14';

/**
 * Hub door definitions (local offsets relative to scene A spawn).
 * Main travel path = walk into glowing frames. Digit keys remain debug/fast travel.
 */
export const DOORS = [
  // v8.5: no floating glow frames. Every door is a physical entrance model; exits are physical too.
  // hubLocal: splat 'from' scene → relative to its spawn; mesh 'from' scene → scene-local.
  { id: 'hub_classroom', label: '教室', from: 'A', to: 'F', hubLocal: [0.8, -7.2], destLocal: [2.0, 6.5], destYaw: Math.PI, exitLocal: [2.0, 9.4], color: 0xffd28a, facade: 'classroom', exitFacade: 'exitdoor' },
  { id: 'hub_nursery', label: '育儿所', from: 'A', to: 'K', hubLocal: [-1.8, -7.5], destLocal: [0, 2.8], destYaw: Math.PI, exitLocal: [0, 4.6], color: 0xffe0a8, facade: 'classroom', exitFacade: 'exitdoor' },
  { id: 'classroom_nursery', label: '隔壁育儿所', from: 'F', to: 'K', hubLocal: [-6.5, 2.0], destLocal: [2.5, 2.0], destYaw: Math.PI/2, exitLocal: [4.2, 2.0], color: 0xffe0a8, facade: 'room', exitFacade: 'exitdoor' },
  { id: 'hub_room', label: '小房间', from: 'A', to: 'D', hubLocal: [-3.8, 3.2], destLocal: [-3.2, 1.5], destYaw: Math.PI, exitLocal: [-3.6, 0.2], color: 0xa8c8ff, facade: 'room', exitFacade: 'exitdoor' },
  { id: 'hub_campus', label: '山洞 · 矿区校园', from: 'A', to: 'B', hubLocal: [1.5, 8.5], destLocal: [0, 0], destYaw: 0, exitLocal: [0, -2.6], color: 0x9dffc2, facade: 'cave', exitFacade: 'cave' },
  { id: 'hub_forest', label: '矿洞 · 林间小路', from: 'A', to: 'G', hubLocal: [7.2, -2.0], destLocal: [0, 7.5], destYaw: Math.PI, exitLocal: [0, 10.4], color: 0x6dff9a, facade: 'mine', exitFacade: 'mine' },
  { id: 'hub_home', label: '家', from: 'A', to: 'H', hubLocal: [2.6, 1.2], destLocal: [0, 2.2], destYaw: Math.PI, exitLocal: [0, 3.9], color: 0xffe08a, facade: 'home', exitFacade: 'exitdoor' },
  { id: 'hub_station', label: '矿车站', from: 'A', to: 'I', hubLocal: [-3.8, -5.0], destLocal: [0, 3.5], destYaw: 0, exitLocal: [0, 7.2], color: 0xffb07a, facade: 'station', exitFacade: 'exitdoor', weathered: true },
  { id: 'hub_shop', label: '小卖部', from: 'A', to: 'J', hubLocal: [-5.8, 0.8], destLocal: [0, 2.0], destYaw: Math.PI, exitLocal: [0, 3.9], color: 0xa8e0ff, facade: 'shop', exitFacade: 'exitdoor' },
  // v8.8 飞船/机场连通：枢纽实体机库门 → ARES 火星基地
  { id: 'hub_ares', label: '飞船口 · ARES', from: 'A', to: 'E', hubLocal: [8.5, 4.5], destLocal: [7, 16], destYaw: Math.PI, exitLocal: [7, 22], color: 0xc8b0ff, facade: 'hangar', exitFacade: 'hangar' },
  // 矿车站也可发车去 ARES（短乘车过场）
  { id: 'cart_ares', label: 'ARES 基地', from: 'I', to: 'E', hubLocal: [0.0, -0.9], hubYaw: 0, destLocal: [5.0, 18], destYaw: 0, exitLocal: [9.0, 18], color: 0xc8b0ff, facade: 'cart', exitFacade: 'cartstop', ride: true },
  // 矿车站里的矿车：走进矿车 = 上车 → 短过场 → 远处场景；那边的矿车停靠点坐回来
  { id: 'cart_mars', label: '火星边疆', from: 'I', to: 'C', hubLocal: [3.2, -0.9], hubYaw: 0, destLocal: [1.5, 0], destYaw: Math.PI, exitLocal: [4.6, 0], color: 0xff8a6a, facade: 'cart', exitFacade: 'cartstop', ride: true },
  { id: 'cart_campus', label: '矿区校园', from: 'I', to: 'B', hubLocal: [-3.6, -0.9], hubYaw: 0, destLocal: [2.4, 1.0], destYaw: 0, exitLocal: [4.4, 2.6], color: 0x9dffc2, facade: 'cart', exitFacade: 'cartstop', ride: true },
];

/** @deprecated v8.3: community hubs are real doors now; kept empty for old callers. */
export const COMMUNITY = [];

export function doorWorldPos(SC, door, which) {
  const key = which === 'hub' ? door.from : door.to;
  const S = SC[key];
  if (!S) return null;
  const loc = which === 'hub' ? door.hubLocal : which === 'dest' ? door.destLocal : door.exitLocal;
  const mesh = S.kind === 'mesh';
  const x = S.off.x + (mesh ? loc[0] : S.spawn[0] + loc[0]);
  const z = S.off.z + (mesh ? loc[1] : S.spawn[1] + loc[1]);
  let yaw = 0;
  if (which === 'hub') yaw = door.hubYaw !== undefined ? door.hubYaw : Math.atan2(-loc[0], -loc[1]); // facade opening faces the hub spawn
  else if (which === 'dest') yaw = door.destYaw;
  else { const d = door.destLocal; yaw = Math.atan2(d[0] - loc[0], d[1] - loc[1]); } // exit opening faces the arrival point
  return { key, x, z, yaw };
}

export function communityWorldPos(SC, hub) {
  const S = SC.A;
  if (!S) return null;
  return {
    x: S.off.x + S.spawn[0] + hub.hubLocal[0],
    z: S.off.z + S.spawn[1] + hub.hubLocal[1],
  };
}

export function nearDoor(px, pz, dx, dz, r = 1.35) {
  return Math.hypot(px - dx, pz - dz) < r;
}

const CARD_KEY = 'dream_v8_charcards';

export function loadCharCards() {
  try {
    return JSON.parse(localStorage.getItem(CARD_KEY) || '{}') || {};
  } catch (_) {
    return {};
  }
}

export function saveCharCards(all) {
  try {
    localStorage.setItem(CARD_KEY, JSON.stringify(all));
  } catch (_) {}
}

/** Ensure placeholder growth fields for a playable name. */
export function ensureCharCard(name) {
  const all = loadCharCards();
  if (!all[name]) {
    all[name] = {
      name,
      经历: ['初入矿山小镇'],
      技能: { 探索: 1, 交谈: 1 },
    };
    saveCharCards(all);
  }
  return all[name];
}

export function bumpCharSkill(name, skill, delta = 1) {
  const all = loadCharCards();
  const c = all[name] || ensureCharCard(name);
  if (!c.技能) c.技能 = {};
  c.技能[skill] = (c.技能[skill] || 0) + delta;
  all[name] = c;
  saveCharCards(all);
  return c;
}

export function appendCharStory(name, line) {
  const all = loadCharCards();
  const c = all[name] || ensureCharCard(name);
  if (!c.经历) c.经历 = [];
  if (c.经历[c.经历.length - 1] !== line) {
    c.经历.push(line);
    if (c.经历.length > 12) c.经历 = c.经历.slice(-12);
  }
  all[name] = c;
  saveCharCards(all);
  return c;
}

/** Public-safe playable roster (Rocketbox MIT / already in public npc/real). */
export const ROSTER_PUBLIC = [
  // v8.5 公开版：只用 Microsoft Rocketbox (MIT) 写实模型；每个都有 Idle / Walk / Jog（Quaternius UAL CC0 重定向）
  { f: 'npc/real/c04_fa11_npc.glb', name: '晓雨' },
  { f: 'npc/real/d01_fa12_npc.glb', name: '小晴' },
  { f: 'npc/real/c05_fa03_npc.glb', name: '小雯' },
  { f: 'npc/real/d02_fa15_npc.glb', name: '小悦' },
  { f: 'npc/real/d03_fp01_npc.glb', name: '阿澄·可玩' },
  { f: 'npc/real/d04_fp02_npc.glb', name: 'Vivi' },
];

/** Public stub: LOCAL==PUBLIC (no YY paths in public tree). Real ROSTER_LOCAL restored only on dream_v8_local via sync --restore-roster. */
export const ROSTER_LOCAL = ROSTER_PUBLIC;
export const NPC_LOCAL = [];

export function pickRoster(isLocal) {
  return isLocal ? ROSTER_LOCAL : ROSTER_PUBLIC;
}
