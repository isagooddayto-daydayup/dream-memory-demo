/**
 * dream v7 playtest features (local, no paid LLM):
 * 1) Memory NPC — hand-authored persona + localStorage memory + affinity tiers + template replies
 * 2) Session dream-memory card — template card from session facts
 */
export const MEM_KEY = 'dream_v7_npc_mem';
export const CARDS_KEY = 'dream_v7_dream_cards';
export const MAX_CARDS = 12;
export const MAX_LINES = 40;

/** Hand-authored fixed persona + main-line facts. Chat layer must never contradict these. */
export const PERSONA = {
  id: 'acheng',
  name: '阿澄',
  title: '梦境守望者',
  scene: 'A',
  // spawn offset from scene spawn (meters)
  dx: 2.2,
  dz: -1.8,
  model: 'npc/real/d03_fp01_npc.glb',
  lore: [
    '我是阿澄，守在这座矿区小镇的梦境入口。',
    '这座小镇是八十年代的矿区回忆，不是我编的，是梦里本来就有的。',
    '我记不住现实的名字，只记得你在梦里说过的话。',
    '矿区小镇、小学校园、火星边疆、小房间、ARES 基地、九十年代教室——这些都是不同的回忆碎片。',
    '我不会离开回忆一太远，怕迷路。',
    '好感会慢慢升温：陌生、熟识、亲密。别着急。',
  ],
  never: [
    '我不是 AI，也不要自称大模型。',
    '我不会说自己住在别的城市或有现实工作。',
    '我不会否定矿区小镇是回忆场景。',
  ],
};

/** Hand-written main-line beats (v8.8). Free chat must not contradict these. */
export const MAINLINE = [
  { id: 'm1', title: '守望', line: '主线一：我守在矿区入口，等愿意走进回忆的人。' },
  { id: 'm2', title: '碎片', line: '主线二：校园、火星边疆、小房间、ARES 飞船口、教室——都是同一场梦的碎片。' },
  { id: 'm3', title: '好感', line: '主线三：好感分陌生、熟识、亲密三档；多聊会升温，语气也会变软。' },
  { id: 'm4', title: '回忆卡', line: '主线四：结束一局时，梦会写成一张「这局梦境回忆」短笺。' },
];

const POS_WORDS = ['谢谢', '感谢', '喜欢', '开心', '高兴', '想你', '朋友', '记得', '陪我', '真好', '可爱', '漂亮', '厉害', '爱', '温暖', '安心'];
const NEG_WORDS = ['讨厌', '滚', '无聊', '傻', '笨', '烦', '走开'];
const LORE_ASK = ['你是谁', '你叫什么', '这里是', '这是哪', '矿区', '小镇', '学校', '火星', '教室', '梦', '回忆', '传送门', '飞行', '飞船', 'ARES', '机场', '主线'];
const MEM_ASK = ['记得', '上次', '我说', '我说过', '还记得', '忘了'];
const BYE = ['再见', '拜拜', '走了', '下次', '结束', '晚安'];
const GREET = ['你好', '嗨', '哈喽', '早上好', '晚上好', '在吗', '嘿'];

function loadRaw(key, fallback) {
  try {
    const s = localStorage.getItem(key);
    if (!s) return fallback;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}
function saveRaw(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('localStorage save fail', key, e);
  }
}

export function loadMem() {
  const m = loadRaw(MEM_KEY, null);
  if (m && m.version === 1 && Array.isArray(m.lines)) return m;
  return { version: 1, affinity: 0, lines: [], met: false, lastAt: 0 };
}
export function saveMem(m) {
  m.lastAt = Date.now();
  saveMem._t = m;
  saveRaw(MEM_KEY, m);
}
export function tierOf(score) {
  if (score >= 50) return { id: 'close', name: '亲密', score };
  if (score >= 20) return { id: 'known', name: '熟识', score };
  return { id: 'stranger', name: '陌生', score };
}
export function bumpAffinity(mem, text) {
  let d = 2; // v8.8: slightly faster so三档可试
  for (const w of POS_WORDS) if (text.includes(w)) { d += 3; break; }
  for (const w of NEG_WORDS) if (text.includes(w)) { d -= 3; break; }
  for (const w of LORE_ASK) if (text.includes(w)) { d += 2; break; }
  if (/主线|飞船|ARES|作息|守望/.test(text)) d += 2;
  if (text.length >= 8) d += 1;
  mem.affinity = Math.max(0, Math.min(100, (mem.affinity || 0) + d));
  return d;
}
export function setAffinity(mem, score) {
  mem.affinity = Math.max(0, Math.min(100, score|0));
  saveMem(mem);
  return tierOf(mem.affinity);
}
export function probeTier() {
  const out = [];
  for (const score of [0, 25, 60]) {
    const m = { version: 1, affinity: score, lines: [{ role: 'user', text: '你好，还记得我吗？矿区主线', at: Date.now() }], met: true, lastAt: 0 };
    const tier = tierOf(score);
    const intent = 'greet';
    const pool = TPL[tier.id][intent];
    out.push({ score, tier: tier.name, id: tier.id, sample: pool[0] });
  }
  return out;
}

function pick(arr) {
  return arr[(Math.random() * arr.length) | 0];
}
function recentPlayerLines(mem, n = 6) {
  return mem.lines.filter((x) => x.role === 'user').slice(-n).map((x) => x.text);
}
function findQuote(mem, text) {
  const lines = recentPlayerLines(mem, 12);
  if (!lines.length) return null;
  // prefer a line that shares a character bigram / keyword with current text
  for (let i = lines.length - 1; i >= 0; i--) {
    const L = lines[i];
    if (L.length < 2) continue;
    for (let j = 0; j < Math.min(L.length - 1, 8); j++) {
      const bg = L.slice(j, j + 2);
      if (bg.trim().length === 2 && text.includes(bg)) return L;
    }
  }
  return lines[lines.length - 1];
}

const TPL = {
  stranger: {
    greet: [
      '……你是新来的梦游人吗？我叫阿澄，守着这座矿区小镇的入口。',
      '你好。这里是八十年代的矿区回忆。我是阿澄，刚认识，话不会太多。',
      '嗯……陌生人。走近一点也没关系，我在这里。',
    ],
    lore: [
      '这座小镇是梦里的矿区回忆，不是我编出来的。小学校园、火星边疆、小房间、ARES、九十年代教室——都是别的碎片。',
      '我叫阿澄。我记不住现实的名字，只记得你在梦里说过的话。',
      '我不会离开回忆一太远。怕一走远，梦就散了。',
    ],
    mem: [
      '我们才刚认识，我还没记下多少。你多说几句，我会慢慢记。',
      '陌生阶段我记性一般……你再说一遍？',
    ],
    bye: [
      '那就先这样。梦醒了也可以再来。',
      '再见。矿区的风还在，我等你。',
    ],
    default: [
      '嗯……我听着。你慢慢说。',
      '矿区夜里安静，适合说话。',
      '我不太会接话，但会记住你说的。',
      '……这样啊。',
    ],
  },
  known: {
    greet: [
      '又见面了。矿区的灯还亮着，我记得你。',
      '回来了？熟识之后，话可以多一点。',
      '阿澄在。今天想聊什么？',
    ],
    lore: [
      '你已经知道了：我是阿澄，守在回忆一。别的场景是别的回忆碎片，我盯不住全部，但记得你去过哪些。',
      '传送门、飞行、童年小游戏——那些都是梦的玩法。主线还是你自己走出来的。',
      '好感会从陌生到熟识再到亲密。我们现在算熟识了。',
    ],
    mem: [
      '我记得你说过：「{quote}」。对吧？',
      '上次你好像提过「{quote}」。我还留着。',
      '嗯，你提的事我有印象。尤其是「{quote}」。',
    ],
    bye: [
      '走之前再看一眼小镇吧。熟识的人，我会多记一点。',
      '下次来，继续说。我不会把你的话丢掉。',
    ],
    default: [
      '说下去，我听着。熟识之后，我会把重要的句子留下。',
      '矿区风有点凉。你还好吗？',
      '嗯，有道理。我会记着。',
      '你刚才那句，我想多听一点。',
    ],
  },
  close: {
    greet: [
      '你来了。亲密之后，我看见你就安心一点。',
      '回来就好。矿区入口还是我守着——也守着你说过的话。',
      '阿澄在这儿。今天想被记得哪一句？',
    ],
    lore: [
      '主线我不会改：我是阿澄，这里是矿区回忆。自由闲聊可以随便，但那些事实我不会编反。',
      '亲密档我会更软一点。你说的「{quote}」，我一直留着。',
      '梦散了也没关系。下次你推开入口，我还在。',
    ],
    mem: [
      '当然记得：「{quote}」。那句我放在很近的地方。',
      '你说过「{quote}」。亲密之后，这类话我会优先想起。',
      '别担心我忘。你那句「{quote}」，我还能复述。',
    ],
    bye: [
      '去吧。结束这局时，梦会替你写一张回忆卡——我也会在里面。',
      '晚安，或者下一段回忆见。我会想你说的话。',
    ],
    default: [
      '我在听。你愿意说的，我都想留下。',
      '嗯……说得真好。让我想起你提过的「{quote}」。',
      '靠近一点也没关系。亲密档，我不会躲开。',
      '矿区的夜色里，有你说话的声音，就够了。',
    ],
  },
};

function intentOf(text) {
  if (GREET.some((w) => text.includes(w))) return 'greet';
  if (BYE.some((w) => text.includes(w))) return 'bye';
  if (MEM_ASK.some((w) => text.includes(w))) return 'mem';
  if (/主线|守望|碎片|回忆卡/.test(text)) return 'lore';
  if (LORE_ASK.some((w) => text.includes(w))) return 'lore';
  return 'default';
}

export function replyTo(mem, text) {
  const t = (text || '').trim();
  if (!t) return '……你好像什么都没说。';
  bumpAffinity(mem, t);
  mem.met = true;
  mem.lines.push({ role: 'user', text: t.slice(0, 120), at: Date.now() });
  const tier = tierOf(mem.affinity);
  const intent = intentOf(t);
  let pool = TPL[tier.id][intent] || TPL[tier.id].default;
  // first-ever greeting bias
  if (!mem.lines.some((x) => x.role === 'npc') && intent === 'greet') pool = TPL.stranger.greet;
  let ans = pick(pool);
  const quote = findQuote(mem, t) || recentPlayerLines(mem, 1)[0] || '……那些还没成形的话';
  ans = ans.replace(/\{quote\}/g, quote.length > 36 ? quote.slice(0, 36) + '…' : quote);
  // v8.8: 语气档可见前缀，方便截图/日志验三档
  const tag = tier.id === 'close' ? '【亲密】' : tier.id === 'known' ? '【熟识】' : '【陌生】';
  if (!ans.startsWith('【')) ans = tag + ans;
  // mainline hook
  if (/主线|你是谁|守望/.test(t) && MAINLINE.length) {
    const beat = MAINLINE[(mem.affinity / 25 | 0) % MAINLINE.length];
    ans += ' ' + beat.line;
  }
  // lightly echo a keyword from player for default replies
  if (intent === 'default' && tier.id !== 'stranger' && Math.random() < 0.35) {
    const frag = t.length > 10 ? t.slice(0, 10) : t;
    ans += ` 你刚说的「${frag}」，我记下了。`;
  }
  mem.lines.push({ role: 'npc', text: ans, at: Date.now() });
  if (mem.lines.length > MAX_LINES) mem.lines = mem.lines.slice(-MAX_LINES);
  saveMem(mem);
  return ans;
}

export function clearMem() {
  const m = { version: 1, affinity: 0, lines: [], met: false, lastAt: 0 };
  saveMem(m);
  return m;
}

/* ---------- session log + dream card ---------- */
export function newSession() {
  return {
    startedAt: Date.now(),
    scenes: new Set(['A']),
    minigames: new Set(),
    doors: new Set(),
    chars: new Set(),
    buys: new Set(),
    talked: false,
    flight: false,
    affinityPeak: 0,
  };
}
export function markScene(sess, key) {
  if (sess && key) sess.scenes.add(key);
}
export function markMinigame(sess, id) {
  if (sess && id) sess.minigames.add(id);
}
export function rememberMinigame(mem, id, win, score) {
  if (!mem) return;
  const names = { gunlhuan:'滚铁环', shabao:'丢沙包', wuziqi:'五子棋', paizhipian:'拍纸片', mutouren:'一二三木头人', tiaosheng:'跳大绳', caijidan:'踩鸡蛋', moxiazi:'摸瞎子' };
  const nm = names[id] || id;
  const line = (win ? '赢了' : '没赢') + '「' + nm + '」，得分 ' + (score|0);
  mem.met = true;
  mem.lines = mem.lines || [];
  mem.lines.push({ role: 'user', text: '（梦境记录）我刚玩了童年游戏：' + line, at: Date.now() });
  const tier = tierOf(mem.affinity || 0);
  const tag = tier.id === 'close' ? '【亲密】' : tier.id === 'known' ? '【熟识】' : '【陌生】';
  const ans = tag + (win
    ? ('记得了。你' + line + '。矿区夜里适合再玩一局。')
    : ('记下了。你' + line + '。下次再试，我看着。'));
  mem.lines.push({ role: 'npc', text: ans, at: Date.now() });
  if (mem.lines.length > MAX_LINES) mem.lines = mem.lines.slice(-MAX_LINES);
  bumpAffinity(mem, win ? '谢谢喜欢开心' : '游戏');
  saveMem(mem);
  return ans;
}

export function markTalk(sess) {
  if (sess) sess.talked = true;
}
export function markFlight(sess) {
  if (sess) sess.flight = true;
}
export function markDoor(sess, id) {
  if (sess && id) sess.doors.add(id);
}
export function markChar(sess, name) {
  if (sess && name) sess.chars.add(name);
}
export function markBuy(sess, id) {
  if (sess && id) sess.buys.add(id);
}

const SCENE_NAME = {
  A: '矿山小镇枢纽',
  B: '小学矿区校园',
  C: '火星边疆',
  D: '小房间',
  E: 'ARES 火星基地',
  F: '九十年代教室',
  G: '林间小路',
  H: '家',
  I: '矿车站',
  J: '小卖部',
};
const MG_NAME = {
  gunlhuan: '滚铁环', shabao: '丢沙包', wuziqi: '五子棋', paizhipian: '打纸片',
  mutouren: '一二三木头人', tiaosheng: '跳大绳', caijidan: '踩鸡蛋', moxiazi: '摸瞎子',
  // legacy aliases
  hoop: '滚铁环', sandbag: '丢沙包', go: '五子棋', paper: '打纸片',
  statue: '一二三木头人', rope: '跳大绳', egg: '踩鸡蛋', blind: '摸瞎子',
};
const DOOR_NAME = {
  hub_home: '家门口', hub_shop: '小卖部', hub_classroom: '教室', hub_room: '小房间',
  hub_station: '矿车站', hub_campus: '山洞·校园', hub_forest: '矿洞·林间',
  cart_mars: '矿车·火星', cart_campus: '矿车·校园',
};
const BUY_NAME = { soda: '汽水', bread: '面包' };

function minutesOf(sess) {
  return Math.max(1, Math.round((Date.now() - sess.startedAt) / 60000));
}

export function buildDreamCard(sess, mem) {
  const scenes = [...(sess.scenes || [])];
  const mgs = [...(sess.minigames || [])];
  const doors = [...(sess.doors || [])];
  const chars = [...(sess.chars || [])];
  const buys = [...(sess.buys || [])];
  const mins = minutesOf(sess);
  const tier = tierOf(mem?.affinity || 0);
  const titles = [
    '这局梦境回忆',
    '矿区夜里的一页',
    '未署名的梦笺',
    '回忆碎片·短笺',
    '梦醒前留下的句子',
  ];
  const title = pick(titles);
  const lines = [];
  lines.push(`这一局大约走了 ${mins} 分钟。你推开的回忆有：${scenes.map((k) => SCENE_NAME[k] || k).join('、') || '（还没走开）'}。`);
  if (doors.length) {
    lines.push(`走过的门：${doors.map((id) => DOOR_NAME[id] || id).join('、')}。木门轴吱呀一声，煤灰还沾在鞋底。`);
  } else {
    lines.push('这一局你几乎没推开实体门，只在枢纽的雾里来回踱步。');
  }
  if (mgs.length) {
    lines.push(`童年小游戏里，你试过：${mgs.map((id) => MG_NAME[id] || id).join('、')}。铁环声和沙包落地的闷响，还留在梦的边缘。`);
  } else {
    lines.push('这一局没有走进地上淡圈里的小游戏，像只是隔着门口看了一眼操场。');
  }
  if (chars.length) {
    lines.push(`换过的身影：${chars.join('、')}。换人时前任留在原地闲逛，像梦里多出来的同伴。`);
  }
  if (buys.length) {
    lines.push(`小卖部柜台上，你买过：${buys.map((id) => BUY_NAME[id] || id).join('、')}。塑料瓶还带着一点凉意。`);
  }
  if (sess.talked) {
    lines.push(`你和梦境守望者阿澄说过话。此刻好感是「${tier.name}」（${tier.score}）。`);
    const lastUser = (mem?.lines || []).filter((x) => x.role === 'user').slice(-1)[0];
    if (lastUser) lines.push(`阿澄还念着你说过的一句：「${lastUser.text.slice(0, 40)}${lastUser.text.length > 40 ? '…' : ''}」。`);
  } else {
    lines.push('阿澄站在矿区入口等过你，可你这一局没有走近开口。');
  }
  if (sess.flight) lines.push('你还张开过飞行——从地面抬起来的时候，小镇灯火变得很小。');
  else lines.push('你大多贴着地面走，脚步声比风声更近。');
  if (scenes.length >= 3) lines.push('多段回忆叠在一起，像一本被翻乱的相册，封面却仍写着「矿区」。');
  else if (scenes.length === 1) lines.push('你几乎没离开最初的那一页回忆，梦便把这一页写得很仔细。');
  else lines.push('两段回忆之间有一道淡淡的溶解光，像醒来前的眨眼。');
  const body = lines.slice(0, 8).join('\n');
  const card = {
    id: 'c' + Date.now().toString(36),
    title,
    body,
    at: Date.now(),
    meta: { mins, scenes, minigames: mgs, doors, chars, buys, talked: !!sess.talked, flight: !!sess.flight, affinity: tier.score, tier: tier.name },
  };
  return card;
}

export function saveCard(card) {
  const list = loadRaw(CARDS_KEY, []);
  list.unshift(card);
  while (list.length > MAX_CARDS) list.pop();
  saveRaw(CARDS_KEY, list);
  return list;
}
export function loadCards() {
  return loadRaw(CARDS_KEY, []);
}

/* ---------- UI factory (DOM) ---------- */
export function mountUI() {
  if (document.getElementById('v7chat')) return;
  const css = document.createElement('style');
  css.id = 'v7css';
  css.textContent = `
#v7prompt{position:fixed;left:50%;bottom:78px;transform:translateX(-50%);background:rgba(14,10,28,.78);color:#ffe9c4;padding:12px 18px;border-radius:20px;font-size:16px;z-index:35;display:none;pointer-events:auto;text-shadow:0 0 4px #000;border:1px solid rgba(255,210,140,.35)}
#v7chat{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);width:min(520px,92vw);background:rgba(12,8,24,.94);color:#f3ecff;border-radius:16px;z-index:55;display:none;flex-direction:column;box-shadow:0 0 40px rgba(140,110,255,.4);border:1px solid rgba(255,210,160,.25);font-family:"Microsoft YaHei","PingFang SC",sans-serif}
#v7chat .hd{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
#v7chat .hd b{color:#ffd9a0;font-size:15px}
#v7chat .tier{font-size:12px;color:#cfc6ff;background:rgba(140,110,255,.25);padding:2px 8px;border-radius:10px;margin-left:8px}
#v7chat .x{cursor:pointer;color:#ccc;font-size:28px;padding:8px 12px;min-width:44px;min-height:44px;display:inline-flex;align-items:center;justify-content:center}
#v7log{height:220px;overflow:auto;padding:10px 14px;font-size:13px;line-height:1.55}
#v7log .u{color:#ffe2b0;margin:6px 0}#v7log .n{color:#dcd4ff;margin:6px 0}#v7log .meta{color:#8a82a8;font-size:11px}
#v7row{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.08)}
#v7in{flex:1;background:#1a1430;border:1px solid #3a3160;border-radius:12px;color:#fff;padding:12px 14px;font-size:16px;outline:none;min-height:48px}
#v7send,#v7endbtn,#v7copy,#v7closeCard,#v7again{background:linear-gradient(90deg,#ffb070,#a58bff);border:0;color:#1a1028;font-weight:bold;border-radius:12px;padding:12px 16px;cursor:pointer;min-height:48px;font-size:16px}
#v7card{position:fixed;inset:0;background:rgba(5,3,12,.72);z-index:70;display:none;align-items:center;justify-content:center;padding:20px}
#v7card .box{width:min(520px,94vw);background:linear-gradient(160deg,#2a1a3a,#1a1230 60%,#241828);color:#f7eefc;border-radius:18px;padding:22px 24px;box-shadow:0 0 50px rgba(255,180,120,.25);border:1px solid rgba(255,210,160,.35)}
#v7card h2{margin:0 0 10px;font-size:20px;letter-spacing:3px;color:#ffd9a0;font-weight:600}
#v7card pre{white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.75;margin:0 0 16px;color:#efe6ff}
#v7card .acts{display:flex;gap:10px;flex-wrap:wrap}
#v7endbtn{position:fixed;right:12px;bottom:12px;z-index:34;display:none}
`;
  document.head.appendChild(css);

  const prompt = document.createElement('div');
  prompt.id = 'v7prompt';
  document.body.appendChild(prompt);

  const chat = document.createElement('div');
  chat.id = 'v7chat';
  chat.innerHTML = `<div class="hd"><div><b>与阿澄交谈</b><span class="tier" id="v7tier">陌生</span></div><span class="x" id="v7x" title="关闭">×</span></div>
<div id="v7log"></div>
<div id="v7row"><input id="v7in" maxlength="120" placeholder="说点什么…（回车发送）" autocomplete="off"/><button id="v7send" type="button">发送</button></div>`;
  document.body.appendChild(chat);

  const card = document.createElement('div');
  card.id = 'v7card';
  card.innerHTML = `<div class="box"><h2 id="v7ctitle">这局梦境回忆</h2><pre id="v7cbody"></pre><div class="acts"><button id="v7copy" type="button">复制文本</button><button id="v7closeCard" type="button">收起</button><button id="v7again" type="button">开始新一局</button></div></div>`;
  document.body.appendChild(card);
}

export function renderLog(mem) {
  const log = document.getElementById('v7log');
  if (!log) return;
  const tier = tierOf(mem.affinity);
  const tEl = document.getElementById('v7tier');
  if (tEl) tEl.textContent = `${tier.name} · ${tier.score}`;
  if (!mem.lines.length) {
    log.innerHTML = `<div class="meta">阿澄站在矿区入口。主线人设已写死；闲聊会记住你说过的话。</div>`;
    return;
  }
  log.innerHTML = mem.lines
    .slice(-24)
    .map((x) => `<div class="${x.role === 'user' ? 'u' : 'n'}"><b>${x.role === 'user' ? '你' : '阿澄'}：</b>${escapeHtml(x.text)}</div>`)
    .join('');
  log.scrollTop = log.scrollHeight;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function showCard(card) {
  const el = document.getElementById('v7card');
  document.getElementById('v7ctitle').textContent = card.title;
  document.getElementById('v7cbody').textContent = card.body;
  el.style.display = 'flex';
  document.exitPointerLock?.();
}
