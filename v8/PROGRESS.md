# 梦境游戏 v8 第一刀进度

时间：2026-10-27（北京时间 / Asia/Shanghai）

## 状态总览
- **已确认**：公开试玩源码 `dream_v8_public/`；本地加厚版 `dream_v8_local/`（含 YY 仿真人，勿上公网）
- **已确认**：门洞系统（矿山枢纽 ↔ 教室 mesh、矿山枢纽 ↔ Remy 小房间）
- **已确认**：角色切换骨架（G / 触屏「角色」）；前任模型留在原地当静止 NPC（最多保留 4 个）
- **发布**：见文末（push 后更新 curl 证据）

## 做了什么
1. 从 `dream_v7_public` 复制出 v8，**未改动 v7 目录**。
2. 枢纽开局仍在 Marble `memA_fujian_town`（矿山小镇），弱化「纯选关」感：出生点附近两扇发光门框。
3. 走进「教室门」→ 淡入教室 mesh 场景 F；房间内门框回矿山。
4. 走进「小房间门」→ Remy 房间（memD）；同样可回矿山。
5. 公开可玩角色表：Rocketbox / 既有 public `npc/real`（无 YY、无 d05 Renderpeople）。
6. 本地版额外：`npc/yy/yy_fb_B_tex4k_npc_rm.glb` + mobile 写实女角色（仍**排除** d05 默认表）。
7. 保留 v7 触屏、阿澄记事 NPC、局后梦境回忆。

## 缺口（诚实）
- Drive 检索「矿山房」未找到专用 Blender 矿山室内；本刀用 **教室 CC0 mesh** + **Remy 房间** 顶第一间/第二间。
- 雨夜、唯美森林、交通节点（机场/车站）**未做**。
- 校园/火星仍可通过数字键 2/3/5 快进，尚未全部改成门洞/山洞连通。
- Windows exe **本刀未重打**（省时间；网页 + local 目录可先玩）。
- 真机帧率、教室风格统一仍属历史未确认项。

## 路径
- 公开：`/workspace/game/demo/dream_v8_public/`
- 本地（含 YY）：`/workspace/game/demo/dream_v8_local/`
- 工作笔记：`/workspace/game/demo/v8work/`
- 逻辑：`dream_v8_world.js`

## 怎么跑
```bash
cd /workspace/game/demo/dream_v8_public && python3 -m http.server 8798
# http://localhost:8798/   触屏加 ?touch=1
# 本地含 YY：
cd /workspace/game/demo/dream_v8_local && python3 -m http.server 8799
```

## 手工试玩
1. 进矿山，找出生点附近两扇发光门框（教室 / 小房间），走进去应传送。
2. 在教室内找回矿山门框，走回去。
3. 按 G 切换角色，应看到前任留在原地。
4. 阿澄金环 E 交谈、M 结束这局仍可用。
