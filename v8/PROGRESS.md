# 回忆与梦境 · v8.7 进度（矿山探索加厚）

**状态**：公开 Pages 覆盖同一 v8 链接 · VERSION **v8.7**  
**更新**：2026-10-29 08:36:31 Asia/Shanghai

## 本版交付
1. **做旧门口**：家 / 小卖部 / 教室 / 小房间门脸统一 OLDTEX 锈铁·木板·砖石·煤灰（对齐矿车站风格）。
2. **童年小游戏**：枢纽 4 个淡圈点（滚铁环·丢沙包·五子棋·打纸片）；校园另有木头人等；触屏可进；滚铁环+丢沙包 E2E 可完一局并 quit 回主场景。
3. **社区闲逛**：枢纽 晓雨/小悦/小晴/小雯 walk/idle（阿澄仍站桩可交谈）；换人 PARKED 继续闲逛。
4. **小卖部可买**：室内货架+柜台汽水/面包；`localStorage dream_v87_shop` 计数；状态栏反馈「买下了…」。
5. **局后梦境回忆**：菜单/结束这局 → 模板中文短笺（门/小游戏/换人/购买/阿澄/飞行），可复制可关闭。
6. **场景密度**：枢纽路灯·煤堆·废铁·木栏·木箱（`placeHubDensity`，约 56 件）；雾 dens 0.028 防糊。
7. VERSION v8.7；公开无 YY 脸、无 Renderpeople。

## 证据
`/workspace/game/demo/v8work/shots_v87/`
- 01a/b/c/d 做旧家·小卖·教室·小房间
- 02 童年游戏点 · 03 NPC 闲逛 · 04 小卖购买反馈 · 05 回忆面板 · 06 手机横屏
- results.json

## 诚实缺口
- 小卖购买无真实商品模型/收银动画，仅计数+文案
- NPC 作息仍是简单路径点，非日程表 AI
- 童年游戏仍是独立 overlay 场景，非枢纽内实时物理
- 主机级体积雾 / 超密破败 PBR / 战斗手感仍不做
- splat 实景材质无法重绘（nosplat/门脸/密度道具可做旧）

## 公开链接
https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/

## v8.8 (2026-10-29 Asia/Shanghai)
- Hub +2 childhood spots: mutouren, tiaosheng (walk-up playable)
- Hangar door hub→ARES (E) + station cart_ares; evening rain particles on hub
- NPC schedule by local hour (早/午/晚) among home/shop/station/plaza; parked join
- Acheng: MAINLINE beats, visible 【陌生/熟识/亲密】tags, faster affinity, probeTiers/setAffinity
- Menu 一键低画质 (fog dens×0.55, shadow off, pixelRatio≤0.55), localStorage dream_v88_gfx
- Same public /v8/ link; free Rocketbox MIT only
## v8.9 (2026-10-29 Asia/Shanghai)
- Rain-night: WEATHER auto/rainnight, denser rain+splash, night lamp/indoor warm contrast
- Hub +moxiazi +caijidan; results → Acheng dream_v7_npc_mem
- Ride boarding UI + 3.2s + arrive title cards (火星/校园/ARES)
- Home sit chair; shop radio toggle + candy/gum shelf
- Scrubbed public /yy/ dead path; privacy scan zero hits
