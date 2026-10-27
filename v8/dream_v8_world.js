/** Dream v8.3 world helpers: doors (incl. home/station/shop interiors), char cards. No paid APIs. */
export const VERSION = 'v8.3';

/**
 * Hub door definitions (local offsets relative to scene A spawn).
 * Main travel path = walk into glowing frames. Digit keys remain debug/fast travel.
 */
export const DOORS = [
  {
    id: 'hub_classroom',
    label: '教室门',
    from: 'A',
    to: 'F',
    hubLocal: [4.5, 2.8],
    destLocal: [2.0, 6.5],
    destYaw: Math.PI,
    exitLocal: [2.0, 9.2],
    exitYaw: 0,
    color: 0xffd28a,
  },
  {
    id: 'hub_room',
    label: '小房间门',
    from: 'A',
    to: 'D',
    hubLocal: [-3.8, 3.2],
    destLocal: [-3.2, 1.5],
    destYaw: Math.PI,
    exitLocal: [-3.6, 0.4],
    exitYaw: 0,
    color: 0xa8c8ff,
  },
  {
    id: 'hub_campus',
    label: '山洞 · 矿区校园',
    from: 'A',
    to: 'B',
    hubLocal: [1.5, 8.5],
    destLocal: [0, 0],
    destYaw: 0,
    exitLocal: [0, -2.4],
    exitYaw: Math.PI,
    color: 0x9dffc2,
  },
  {
    id: 'hub_mars',
    label: '洞穴 · 火星边疆',
    from: 'A',
    to: 'C',
    hubLocal: [-1.5, -7.0],
    destLocal: [1.5, 0],
    destYaw: Math.PI,
    exitLocal: [3.2, 0],
    exitYaw: 0,
    color: 0xff8a6a,
  },
  {
    id: 'hub_forest',
    label: '林间小路',
    from: 'A',
    to: 'G',
    hubLocal: [7.2, -2.0],
    destLocal: [0, 7.5],
    destYaw: Math.PI,
    exitLocal: [0, 10.2],
    exitYaw: 0,
    color: 0x6dff9a,
  },
  {
    id: 'hub_home',
    label: '家门口',
    from: 'A',
    to: 'H',
    hubLocal: [2.6, 1.2],
    destLocal: [0, 2.2],
    destYaw: Math.PI,
    exitLocal: [0, 4.6],
    exitYaw: 0,
    color: 0xffe08a,
    facade: 'home',
  },
  {
    id: 'hub_station',
    label: '矿车站',
    from: 'A',
    to: 'I',
    hubLocal: [-3.8, -5.0],
    destLocal: [0, 3.5],
    destYaw: Math.PI,
    exitLocal: [0, 7.2],
    exitYaw: 0,
    color: 0xffb07a,
    facade: 'station',
  },
  {
    id: 'hub_shop',
    label: '小卖部',
    from: 'A',
    to: 'J',
    hubLocal: [-5.8, 0.8],
    destLocal: [0, 2.0],
    destYaw: Math.PI,
    exitLocal: [0, 4.4],
    exitYaw: 0,
    color: 0xa8e0ff,
    facade: 'shop',
  },
];

/** @deprecated v8.3: community hubs are real doors now; kept empty for old callers. */
export const COMMUNITY = [];

export function doorWorldPos(SC, door, which) {
  const key = which === 'hub' ? door.from : door.to;
  const S = SC[key];
  if (!S) return null;
  const loc = which === 'hub' ? door.hubLocal : which === 'dest' ? door.destLocal : door.exitLocal;
  return {
    key,
    x: S.off.x + (which === 'hub' ? S.spawn[0] + loc[0] : (S.kind === 'mesh' ? loc[0] : S.spawn[0] + loc[0])),
    z: S.off.z + (which === 'hub' ? S.spawn[1] + loc[1] : (S.kind === 'mesh' ? loc[1] : S.spawn[1] + loc[1])),
    yaw: which === 'hub' ? 0 : which === 'dest' ? door.destYaw : door.exitYaw,
  };
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
  { f: 'npc/FP02.glb', name: '小芳' },
  { f: 'npc/real/d03_fp01_npc.glb', name: '阿澄·可玩' },
  { f: 'npc/real/c04_fa11_npc.glb', name: '晓雨' },
  { f: 'npc/real/c05_fa03_npc.glb', name: '小雯' },
  { f: 'npc/real/d01_fa12_npc.glb', name: '小晴' },
  { f: 'npc/real/d04_fp02_npc.glb', name: 'Vivi' },
];

/** Public build never uses local roster. */
export const ROSTER_LOCAL = ROSTER_PUBLIC;

export function pickRoster(isLocal) {
  return ROSTER_PUBLIC;
}
