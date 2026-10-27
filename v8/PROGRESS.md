# 梦境游戏 v8.2 进度

时间：2026-10-27（北京时间 / Asia/Shanghai）

## 状态总览
- **已确认**：v8.0 枢纽门洞（教室 F、小房间 D）+ 角色切换；v8.1 校园/火星门
- **本刀 v8.2**：林间小路可走迷你森林（Kenney CC0）+ 社区标记（家门口/矿车站/小卖部）+ 角色卡 localStorage
- **已确认**：公开包无 YY 脸、无 Renderpeople d05；local 仍含 YY
- **发布**：见文末

## 做了什么
1. `dream_v8_world.js` → `VERSION=v8.2`，`DOORS` 增至 5（+ `hub_forest`「林间小路」→ G）。
2. 新增 mesh 场景 G：`scenes/forest/*.glb`（Kenney City Kit Suburban / Retro Urban，CC0）拼可走清林 + 浅水盘。
3. `COMMUNITY` 三标记：家门口 / 矿车站（告示「班车即将开通」并指向火星门）/ 小卖部。
4. 角色卡：localStorage `dream_v8_charcards`（经历[]、技能{}），菜单面板显示；换人/过门会写经历、探索+1。
5. 同步 public + local（local 保留 YY roster）。

## 手工试玩
1. 矿山 → 东侧绿门「林间小路」→ 应进森林空地 → 「回矿山」门走回。
2. 走近家门口 / 矿车站 / 小卖部光柱 → 中文告示。
3. M 菜单看角色卡；G 换人后经历变长。

## 路径
- 公开：`/workspace/game/demo/dream_v8_public/`
- 本地（含 YY）：`/workspace/game/demo/dream_v8_local/`
- 工作笔记：`/workspace/game/demo/v8work/`

## 缺口（诚实）
- 无 Marble 写实唯美森林 / 雨夜 spz；本刀用 Kenney 低配可走林区代替，非摄影级。
- 矿山专用 Blender 房间仍缺；车站/小卖部仅为告示骨架，未做真实班车或商店 UI。

## 发布
- 试玩（覆盖 v8/）：https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/
- **已确认**：push isagooddayto-daydayup/dream-memory-demo main，功能 commit 9331bb1（其后文档戳记 c50ebaf / 5886efe）。
- Pages HTTP 200，正文含 v8.2；dream_v8_world.js 含 hub_forest / COMMUNITY；scenes/forest/tree-large.glb 200（探测约 2026-10-27 08:21 北京时间）。
