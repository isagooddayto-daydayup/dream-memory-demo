# 梦境游戏 v7 试玩进度

时间：2026-10-26（北京时间）

## 做了什么（已确认）

从 `dream_v6_public` / `dream_v6_mobile` 复制出 v7，未改动 v6 目录。

### Feature 1 — 记事 NPC「阿澄」
- 人设/主线手写死（矿区守望者；不编造矛盾设定）。
- 闲聊：本地模板 + 关键词意图 + 引用玩家说过的话；**无付费 LLM / 无 Craft**。
- 好感：陌生（0–19）/ 熟识（20–49）/ 亲密（≥50）；存 `localStorage` 键 `dream_v7_npc_mem`。
- UX：场景 1 出生点附近金环；走近按 **E**（手机点提示）开聊天面板；Esc/× 关闭回行走。
- 与小游戏 E 键冲突处理：靠近阿澄时优先交谈。

### Feature 2 — 局后「这局梦境回忆」
- 轻量记录：走过的场景 1–6、进入的小游戏、是否与阿澄交谈、是否飞行、时长。
- **M 菜单 →「结束这局 · 生成梦境回忆」**；模板填空生成中文短笺（标题 + 数句）。
- 可复制文本；最近最多 12 张存 `dream_v7_dream_cards`。

### 许可 / 公开范围
- `dream_v7_public`：仅 MIT Rocketbox + CC0 教室；无 YY 脸、无 Renderpeople。
- `dream_v7_mobile`：保留本地角色表，**勿直接公开上传**。

## 路径
- 公开试玩源码：`/workspace/game/demo/dream_v7_public/`
- 手机本地版：`/workspace/game/demo/dream_v7_mobile/`
- 本工作笔记：`/workspace/game/demo/v7work/PROGRESS.md`
- 逻辑单测：`/workspace/game/demo/v7work/test_v7_logic.mjs`（已跑通：约 8 句可到「熟识」）

## 怎么跑
```bash
cd /workspace/game/demo/dream_v7_public
python3 -m http.server 8797
# 浏览器打开 http://localhost:8797/
```

## 手工测试步骤
1. 进入场景 1，走向出生点附近金环 NPC「阿澄」，按 E。
2. 依次说：你好 / 你是谁 / 谢谢 / 我喜欢这里 / 朋友陪我 / 真好温暖 … 观察好感从陌生升到熟识。
3. 刷新页面，再按 E：应仍看到先前对话。
4. 按 2 或进一个小游戏、空格飞一下，再按 M →「结束这局」：卡片正文应含对应场景/游戏/交谈/飞行信息。
5. 点「复制文本」；点「开始新一局」重置本局统计（不清阿澄长期记忆，除非点菜单「清空阿澄记忆」）。

## 已知限制
- 对话是模板，不是大模型；长句理解弱，但不会胡编主线。
- 好感靠关键词/句长，可被刷分；试玩够用。
- 阿澄只放在场景 A；其它场景暂无记事 NPC。
- 真机帧率、教室风格统一仍属 v6 遗留未确认项。
- 在线发布状态见本文件「发布」一节（提交后更新）。

## 发布
- **已确认**：已 push 到 `isagooddayto-daydayup/dream-memory-demo` main，commit `e87308b`。
- 试玩链接：https://isagooddayto-daydayup.github.io/dream-memory-demo/v7/
- 本地同源：`/workspace/game/demo/dream_v7_public/`
- **Pages 已确认 HTTP 200**（北京时间约 2026-10-26 21:14 探测）：页面含「回忆与梦境 · v7」「阿澄」「dream_v7_features」。

## 触屏增强（2026-10-27）
- 已确认改动：Pointer Events + 大按钮（交谈/菜单/结束这局/场景 chips）+ Electron 默认 `?touch=1`
- 说明：`/workspace/game/demo/v7work/TOUCH.md`
- 网页强制触屏：在 URL 后加 `?touch`
- 操作：左半屏走、右半屏转视角；点大按钮交谈/菜单/结束这局
