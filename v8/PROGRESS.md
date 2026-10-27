# 梦境游戏 v8.1 进度

时间：2026-10-27（北京时间 / Asia/Shanghai）

## 状态总览
- **已确认**：v8.0 枢纽门洞（教室 F、小房间 D）+ 角色切换
- **本刀 v8.1**：矿山枢纽再加 **2** 扇世界门（校园 memB、火星边疆 memC），含回程门；数字键保留为调试快进
- **已确认**：公开包无 YY 脸、无 Renderpeople d05；local 仍含 YY
- **发布**：见文末

## 做了什么
1. `dream_v8_world.js` → `VERSION=v8.1`，`DOORS` 增至 4：
   - `hub_classroom` → F 教室（保留）
   - `hub_room` → D 小房间（保留）
   - `hub_campus`「山洞 · 矿区校园」→ B（hub 北侧约 +8.5z）
   - `hub_mars`「洞穴 · 火星边疆」→ C Marble Mars Frontier（hub 南侧约 -7z；**未**接 ARES mesh，标签写清「火星边疆」）
2. 同步门洞到 `dream_v8_local/`（保留本地 YY 角色表）。
3. HUD / 菜单 / README 标明「门洞是主路，数字键快进」。
4. **未做**：雨夜/森林施工中门（避免误导）；Windows exe 本刀不打；仍等 YY 矿山房素材。

## 手工试玩
1. 矿山出生 → 北侧青绿门「山洞 · 矿区校园」走进 → 应到校园 → 找「回矿山」门走回。
2. 矿山 → 南侧橙红门「洞穴 · 火星边疆」走进 → 应到火星 → 回矿山。
3. 原教室/小房间门仍可用；G 换人、阿澄 E、结束这局仍可用。

## 路径
- 公开：`/workspace/game/demo/dream_v8_public/`
- 本地（含 YY）：`/workspace/game/demo/dream_v8_local/`
- 工作笔记：`/workspace/game/demo/v8work/`

## 发布
- 试玩（覆盖 v8/）：https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/
- 
- **已确认**：push `isagooddayto-daydayup/dream-memory-demo` main，commit `fd9ed51`。
- 试玩：https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/
- Pages 探测时间约 2026-10-27 08:14 CST（见执行记录）。
