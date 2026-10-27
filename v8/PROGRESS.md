# 梦境游戏 v8.5 进度

时间：2026-10-27 17:24:59（北京时间 / Asia/Shanghai）

## 状态总览
- **本刀 v8.5**：真人骨骼动画（idle/walk/run + 转身碎步）；换人后前任留原地作闲逛 NPC；去掉漂浮发光门框，只走实体门口/矿车/山洞；公开版 Rocketbox MIT 最逼真角色 + 近景特写；私密版含 YY + Windows exe
- **发布**：**已确认**（Pages 200，含 v8.5）
- **验证**：Playwright Chromium + SwiftShader；`?emu=1&nosplat=1` 功能证据 + 普通模式（无 emu）mixer/骨骼数据证据
- **公开包**：无 YY 脸、无 Renderpeople；仅 Rocketbox MIT

## 做了什么
1. **动画**：Rocketbox 自带 Idle_Loop/Walk_Loop；Jog_Fwd_Loop 由 Quaternius UAL1（CC0）重定向到各角色（Blender 4.2 headless）；SkeletonUtils.clone 修 T 字；换人 `parkCurrentChar` 前任带 mixer 闲逛
2. **门**：去掉漂浮发光门框；9 条 DOORS（家/小卖部/教室/小房间/山洞校园/矿洞林间/矿车站 + 矿车→火星/校园）；实体 facade（cave/mine/cart/home/shop/classroom…）；矿车「上车」1.8s 过场
3. **公开角色**：晓雨 c04 / 小晴 d01 / 小雯 c05 / 小悦 d02 / 阿澄·可玩 d03 / Vivi d04（全 Rocketbox MIT）；近景特写 Z + FILL 补光
4. **私密**：dream_v8_local 含 YY + Claudia/Carla/Sophia/小夏；Windows exe 替换 Electron v7 树；切分 ~90MB；上传 YY 本人 Google Drive（不共享）
5. **林间贴图**：补齐 Kenney CC0 Textures（colormap/treeA/treeB/dirt/tiles）

## 自查证据（/workspace/game/demo/v8work/shots_v85/）
| # | 文件 | 结果 |
|---|---|---|
| ① | 01_idle.png | confirmed：非 T 字，Idle_Loop 权重 1，骨骼四元数随时间变 |
| ② | 02_walk.png / 02b_run.png | confirmed：walk/run 权重正确 |
| ③ | 03a/b/c_*switch*.png | confirmed：晓雨→小晴，前任 mixer 闲逛 walkW≈0.86 |
| ④ | 04a–e | confirmed：进矿车站→上车 overlay→火星边疆→坐回→回枢纽 |
| ⑤ | 05a/b | confirmed：进家门 / 室内出口门 |
| ⑥ | 06a–d | confirmed：山洞→校园、矿洞→林间 |
| ⑦ | 07_closeup.png | confirmed：近景脸清晰 |
| ⑧ | 08_yy_local_*.png | confirmed（仅本地）：YY 开局在场、可切、mixer+walk；**不上传公开处** |
| 视频 | demo_01to06.mp4 | 28s |
| 普通模式 | normal_mode_probe.json | mixer_advances + bone_changes = true（无 emu） |

## 缺口（诚实）
- 无独立 turn clip，原地转身用 walk 碎步混合
- 矿车过场中角色未做「坐姿」专用动画（约 1.8s，保持 idle）
- 真机未测；Playwright 模拟器帧率偏低（~22–40）
- Sophia/小夏无 jog 重定向 → run 回退为加速 walk（runIsWalk）
- cutscenes/manifest.json 仍 404（v8.4 起既有，不影响主路）

## 发布（证据）
- 试玩：https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/
- 功能 commit （71c31549b8d9a86896296f0ba0566828c93a4690，2026-10-27 17:23:23 北京时间）
- Pages last-modified 2026-10-27 17:24:12 北京时间（Tue, 27 Oct 2026 09:24:12 GMT）；探测 index/world 均 200，含 v8.5、parkCurrentChar、toggleClose、SkeletonUtils；world VERSION=v8.5、9 DOORS、公开 roster 仅 Rocketbox；无 npc/yy
- 私密 exe：/workspace/game/offline/梦境游戏v8.5私密版-win32-x64/（~399MB 未压缩；zip 222MB，3 part）；上传 YY Google Drive（不共享）
