/** Dream v8.1 world helpers: door volumes + parked playable NPCs. No paid APIs. */
export const VERSION = 'v8.1';

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
    // north of spawn — flat trail / cave mouth metaphor
    hubLocal: [1.5, 8.5],
    destLocal: [0, 0],
    destYaw: 0,
    // return door slightly south of campus spawn so you don't re-trigger instantly
    exitLocal: [0, -2.4],
    exitYaw: Math.PI,
    color: 0x9dffc2,
  },
  {
    id: 'hub_mars',
    label: '洞穴 · 火星边疆',
    from: 'A',
    to: 'C',
    // south of spawn — cave to Marble Mars Frontier (not ARES mesh)
    hubLocal: [-1.5, -7.0],
    destLocal: [1.5, 0],
    destYaw: Math.PI,
    exitLocal: [3.2, 0],
    exitYaw: 0,
    color: 0xff8a6a,
  },
];

export function doorWorldPos(SC, door, which) {
  // which: 'hub' | 'dest' | 'exit'
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

export function nearDoor(px, pz, dx, dz, r = 1.35) {
  return Math.hypot(px - dx, pz - dz) < r;
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
