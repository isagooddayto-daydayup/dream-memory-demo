/**
 * memory_card_lore_hooks.js — 可粘贴草稿（未接线）
 * 从 lore_snippets.json 抽 14 条做成回忆卡展示用数组。
 * 字段：id / text / place / tags
 * 约束：中文 · 1990s 闽西矿山小镇感官 · 无 YY 真名
 * 仅 v8work；勿改 dream_v8_public。
 *
 * 用法示意（局末回忆卡）：
 *   import { MEMORY_CARD_LORE_HOOKS, pickMemoryHooks } from './memory_card_lore_hooks.js';
 *   const cards = pickMemoryHooks(3, { place:'station', weather:'rain' });
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const api = factory();
    root.MEMORY_CARD_LORE_HOOKS = api.MEMORY_CARD_LORE_HOOKS;
    root.pickMemoryHooks = api.pickMemoryHooks;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  /** @type {{id:string,text:string,place:string,tags:string[],src?:string}[]} */
  const MEMORY_CARD_LORE_HOOKS = [
    {
      id: 'mc01',
      text: '袖口蹭过煤堆，细灰在指缝里发亮。',
      place: 'plaza',
      tags: ['煤灰', '枢纽'],
      src: 's01'
    },
    {
      id: 'mc02',
      text: '窗台灰被雨冲出两道深浅痕。',
      place: 'home',
      tags: ['煤灰', '雨', '家'],
      src: 's03'
    },
    {
      id: 'mc03',
      text: '雨棚铁皮补丁叠补丁，锈成暗红。',
      place: 'station',
      tags: ['锈铁', '车站'],
      src: 's06'
    },
    {
      id: 'mc04',
      text: '站牌螺丝松了，风里轻轻磕。',
      place: 'station',
      tags: ['锈铁', '车站', '1987'],
      src: 's09'
    },
    {
      id: 'mc05',
      text: '雨丝斜着切过路灯光锥。',
      place: 'plaza',
      tags: ['雨', '雨夜'],
      src: 's11'
    },
    {
      id: 'mc06',
      text: '檐水打在空铁桶上，像慢节拍。',
      place: 'shop',
      tags: ['雨', '小卖'],
      src: 's12'
    },
    {
      id: 'mc07',
      text: '积水里倒映出门楣，又被脚步搅碎。',
      place: 'home',
      tags: ['雨', '家', '雨夜'],
      src: 's13'
    },
    {
      id: 'mc08',
      text: '广播嘶一声，吐出半句「请旅客注意」。',
      place: 'station',
      tags: ['广播', '车站'],
      src: 's17'
    },
    {
      id: 'mc09',
      text: '地方戏曲拖腔被雷掐断在半句。',
      place: 'plaza',
      tags: ['广播', '雨夜'],
      src: 's18'
    },
    {
      id: 'mc10',
      text: '站牌背面白漆下，隐约是一九八七。',
      place: 'station',
      tags: ['车站', '1987'],
      src: 's22'
    },
    {
      id: 'mc11',
      text: '时刻表被铁丝绑在柱上，字迹发黄。',
      place: 'station',
      tags: ['车站', '时刻表'],
      src: 's25'
    },
    {
      id: 'mc12',
      text: '汽水瓶壁起雾，凉意从指尖爬上来。',
      place: 'shop',
      tags: ['小卖', '汽水'],
      src: 's27'
    },
    {
      id: 'mc13',
      text: '日历停在某个不重要的日子。',
      place: 'home',
      tags: ['家', '日历'],
      src: 's32'
    },
    {
      id: 'mc14',
      text: '雾浓时广播更远，像从井底喊上来。',
      place: 'station',
      tags: ['广播', '雾', '雨夜'],
      src: 's40'
    }
  ];

  /**
   * @param {number} n
   * @param {{place?:string,tag?:string,weather?:string}} [opts]
   */
  function pickMemoryHooks(n, opts) {
    opts = opts || {};
    let pool = MEMORY_CARD_LORE_HOOKS.slice();
    if (opts.place) {
      const p = opts.place;
      const hit = pool.filter(function (x) { return x.place === p; });
      if (hit.length) pool = hit.concat(pool.filter(function (x) { return x.place !== p; }));
    }
    if (opts.tag) {
      const t = opts.tag;
      pool = pool.filter(function (x) { return x.tags && x.tags.indexOf(t) >= 0; }).concat(
        pool.filter(function (x) { return !(x.tags && x.tags.indexOf(t) >= 0); })
      );
    }
    if (opts.weather === 'rain') {
      pool = pool.filter(function (x) {
        return x.tags && (x.tags.indexOf('雨') >= 0 || x.tags.indexOf('雨夜') >= 0 || x.tags.indexOf('雾') >= 0);
      }).concat(pool);
    }
    const seen = {};
    const out = [];
    for (let i = 0; i < pool.length && out.length < (n | 0 || 3); i++) {
      const id = pool[i].id;
      if (seen[id]) continue;
      seen[id] = 1;
      out.push(pool[i]);
    }
    return out;
  }

  return { MEMORY_CARD_LORE_HOOKS: MEMORY_CARD_LORE_HOOKS, pickMemoryHooks: pickMemoryHooks };
});
