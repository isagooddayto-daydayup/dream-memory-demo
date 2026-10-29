# npc_banter_20261029 · 矿山小镇 NPC 闲聊句库

**路径**：`/workspace/game/demo/v8work/npc_banter_20261029.json`  
**时间**：北京时间 2026-10-29（CST）  
**范围**：本地资产，**未**进 `dream_v8_public` / Pages / Drive。

## 角色（6）

| name | id | 挂点摘要 | 句数 |
|---|---|---|---|
| 晓雨 | xiaoyu | 小卖/广场/家门 · 木头人 | 18 |
| 小晴 | xiaoqing | 车站/家/小卖 · 沙包/班次 | 18 |
| 小雯 | xiaowen | 广场树下/车站 · 五子/跳绳 | 18 |
| 小悦 | xiaoyue | 家门口/傍晚车站 | 18 |
| 阿澄 | acheng | 入口广场 · talkable 主线 | 18 |
| Vivi | vivi | ARES 机库 · 打纸片 | 18 |

每角 `banter.stranger` / `familiar` / `intimate` 各 6 句（≥12 合计）。

## 给 v8.12 的 import

1. 把 JSON 拷到 public 静态目录（或同域可 fetch 路径），例如 `demo/dream_v8_public/data/npc_banter_20261029.json`。
2. 在 `dream_v7_features.js` 或 `index.html` 闲聊分支：
   - 非阿澄：按 `name` + 好感档抽 `banter[tier]`。
   - 阿澄：可与现有 `TPL` 合并；`familiar`≈`known`，`intimate`≈`close`。
3. 触发词见各角 `triggers`（靠近小游戏圈 / 买汽水 / 检票等可加权抽句）。
4. `persona.never` 必须在生成层硬过滤。

```js
const BANTER = await (await fetch('./data/npc_banter_20261029.json')).json();
function pickBanter(name, tierId) {
  const map = { stranger:'stranger', known:'familiar', close:'intimate',
                familiar:'familiar', intimate:'intimate' };
  const c = BANTER.characters.find(x => x.name === name);
  if (!c) return null;
  const pool = c.banter[map[tierId] || 'stranger'];
  return pool[(Math.random() * pool.length) | 0];
}
```

## 来源与边界

- 气质回声自 `/workspace/game/novel/text.txt`（矿山→住校、棋、赶路），**不**搬小说原句主角真名。
- 阿澄主线与任务板与现网 `dream_v7_features.js` 对齐。
- 公开安全：无 YY 脸、无私密链接、无付费素材。

## 校验

```bash
python3 -c "import json;d=json.load(open('/workspace/game/demo/v8work/npc_banter_20261029.json'));assert len(d['characters'])>=6;assert all(sum(len(c['banter'][k]) for k in c['banter'])>=12 for c in d['characters']);print('ok',d['stats'])"
```
