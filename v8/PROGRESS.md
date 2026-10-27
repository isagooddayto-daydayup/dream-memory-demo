# 梦境游戏 v8.3 进度

时间：2026-10-27 08:42:52（北京时间 / Asia/Shanghai）

## 状态总览
- **本刀 v8.3**：家门口 / 矿车站 / 小卖部 → 可走进实体入口 + 程序化室内；去掉光柱告示；触屏进门加大、门提示上移
- **保留**：教室/小房间/校园/火星/林间门洞；角色卡；触屏摇杆
- **公开包**：无 YY 脸、无 Renderpeople d05

## 做了什么
1. `dream_v8_world.js` → `VERSION=v8.3`，`DOORS` + `hub_home` / `hub_station` / `hub_shop`（COMMUNITY placard 清空）
2. 场景 H/I/J：程序化家室内 / 候车棚（墙上「班车即将开通」）/ 小卖部柜台货架
3. 枢纽实体 facade（门框+门脸/雨棚/遮阳）
4. 触屏：进门半径 2.05；门提示 bottom 220px；场景芯片换行；更新「触屏怎么玩.txt」

## 路径
- 公开：`/workspace/game/demo/dream_v8_public/`
- 本地（含 YY）：`/workspace/game/demo/dream_v8_local/`
- 试玩：https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/

## 缺口（诚实）
- 室内为低模程序化，非 Marble / 非矿山专用 Blender 房
- 班车与小卖部交易未做
