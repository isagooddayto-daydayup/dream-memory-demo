# SFX 目录 · 现有 id + 缺口（v8.20 旁路草案）

- 日期：2026-10-29（北京时间 Asia/Shanghai）
- 范围：**仅 v8work 未接线草稿**，不改 `dream_v8_public` / local / Win / Pages / Drive
- 对照源（只读）：
  - `dream_v8_public/minigames.js` → `snd(type, pan=0)`（WebAudio 合成，0 素材）
  - `dream_v8_public/index.html` → `playBeep(freq,dur,type,gain)` + 调用点
  - `v8work/ATMO_RAIN_STATION_DRAFT_v815.md` §4 命名 cue（未接线）
  - `v8work/snippets/minigame_sfx_copy_v814.json`（文案库，非波形）
- 标记：**已有** = public 已落地；**缺口** = 无专用波形 / 仅文案或视觉

程序化补丁草稿见 `snippets/sfx_procedural_cues_v820.js`（Oscillator + 可选噪声 Buffer，**无外部 wav**）。

---

## 1. 小游戏 `snd()` 类型表（已有）

源：`minigames.js` L120–124。共享 `AudioContext`；`clap|pop|slap` 用 `createBuffer` 噪声脉冲；其余用 `createOscillator` triangle。

| id | 合成方式 | 关键参数 | 调用约次 | 典型用途 |
|----|----------|----------|----------|----------|
| `ok` | Oscillator triangle | f=880，gain 0.25→0.001 / ~0.18s | ~11 | 得分、接住、吃子、跳对格 |
| `bad` | Oscillator triangle | f=180，同上 | ~12 | 失误、出局、失败 finish |
| `win` | Oscillator triangle | f=660，衰减 ~0.6s | ~1 + finish(win) | 通关；`MG.finish(true)` |
| `tick` | Oscillator triangle | f=520 | ~7 | 节拍、空踢、选子、翻牌提示 |
| `clap` | Buffer noise | 指数衰减，可 `pan` | 1 | 摸瞎子方向提示（立体声 pan） |
| `slap` | Buffer noise | 同 clap，gain≈0.6 | ~9 | 扔石子/沙包/踩、打牌出牌、军棋落子 |
| `pop` | Buffer noise | 更快衰减，gain≈0.9 | 1 | 踩鸡蛋破球 |
| _(fallback)_ | Oscillator | f=440 | — | 未知 type 时 |

`MG.finish(win,text)` → `snd(win?'win':'bad')`。

文案旁路 `minigame_sfx_copy_v814.json` 的 `snd_types_ref` 与上表一致；**不新增波形 id**。

---

## 2. 世界 `playBeep()` 调用表（已有）

源：`index.html` `playBeep`（独立 `playBeep.ctx`，sine/triangle/sawtooth/square Oscillator）。

| 场景 | 参数摘要 | 状态 | 备注 |
|------|----------|------|------|
| 主线奖励 `playQuestReward` | 660 sine → 990 triangle → 520 sine | 已有 | 非 named cue id |
| 车站广播 `speakStationPA` | 280 sawtooth + 220 sawtooth | 已有 | **无** PA 嘶声 / 雨底噪；仅双短 beep |
| 社区跑腿推进 `errandHook` | 740 sine 0.1s | 已有 | |
| 小卖部购买 `shopBuy` | 520 square → 680 square | 已有 | |
| 家里收音机 `toggleHomeRadio` | **无 beep** | 缺口 | 仅 UI / 文案「串台」 |
| 进门 `useDoor` / `finishDoor` / `startDissolve` | **无 audio** | 缺口 | 纯视觉 dissolve |
| 雨 `placeRain` / `WEATHER` | **无 audio** | 缺口 | 仅粒子 + fog |
| 油灯 / 日历 / 坐凳 | **无 audio** | 缺口（低优） | |

---

## 3. 缺口矩阵（雨 / 广播 / 门 / 小游戏）

| 缺口域 | 现状 | 建议 cue id（旁路） | 触发建议 | 优先级 |
|--------|------|---------------------|----------|--------|
| 雨 · 铁皮棚 | 无雨声 | `rain_iron` | cur=I 且 rain；轻循环或短 burst | 高 |
| 雨 · 溅落短促 | 无 | `rain_drip` | splash 可见时偶发 | 中 |
| 广播 · 注意铃 | 仅双 saw beep | `pa_chime` | `speakStationPA` 文案前 | 高 |
| 广播 · 线路嘶 | 无 | `pa_hiss` | 雨夜 I 环境 / 串台前缀 | 高 |
| 广播 · 戏曲碎片 | 文案有、无声 | `pa_opera_bleed`（命名保留；本草稿未实现波形） | 随机 40–90s | 低（下轮） |
| 门 · 闩/锁舌 | dissolve 无声 | `door_latch` | `useDoor` enter 起点 | 高 |
| 门 · 木门沉响 | 无 | `door_wood` | 托儿所/家木门 enter | 中 |
| 小游戏 · 落地 | 多用 `ok`/`tick` | `hop_land` | 跳房子落地 | 中 |
| 小游戏 · 踢毽 | 成功=`ok` | `jianzi_kick` | 踢中瞬间 | 中 |
| 小游戏 · 牌面 | 出牌=`slap` | `card_snap` | 打牌翻/出 | 低 |

对齐 ATMO v8.15 命名：`pa_arrive|delay|ticket|watchstep|hiss_loop|opera_bleed`、`sfx_rain_iron`、`sfx_coal_crunch` —— 本轮实现 **短 one-shot** 子集（见下节）；煤灰脚步 / 戏曲串台留空。

---

## 4. 本轮程序化实现（`sfx_procedural_cues_v820.js`）

| cue id | 主技术 | 时长约 | 对应缺口 |
|--------|--------|--------|----------|
| `rain_iron` | 噪声 Buffer + 薄 Osc 金属头 | ~0.45s | 雨 |
| `rain_drip` | Oscillator sine 下滑 | ~0.12s | 雨 |
| `pa_chime` | 双 Oscillator sawtooth | ~0.22s | 广播 |
| `pa_hiss` | 噪声 Buffer 短嘶 | ~0.35s | 广播 |
| `door_latch` | 高方波 click + 低 thud | ~0.18s | 门 |
| `door_wood` | 低 sine 下滑 | ~0.28s | 门 |
| `hop_land` | triangle 短衰减 | ~0.14s | 小游戏 |
| `jianzi_kick` | triangle + 轻噪声头 | ~0.16s | 小游戏 |

另导出 `card_snap` 可选别名；`playProcCue(id, opts)` 统一入口，风格对齐 `snd`/`playBeep`。
核心 8 id：`PROC_SFX_CORE_IDS`。

---

## 5. 接线提示（主线合并时 · 本旁路不接线）

1. 小游戏：可在 `snd()` 内扩展 type 分支，或 `snd` 外调用 `playProcCue`。
2. 世界：`speakStationPA` 把现有双 `playBeep` 换成 `pa_chime` + 可选 `pa_hiss`；`useDoor` 开头播 `door_latch`；雨夜 tick 偶发 `rain_iron`。
3. **勿**引入外部 wav / CDN；保持 0 素材。
4. lowq：跳过 `rain_iron` 循环，只留 `pa_chime`。

---

## 6. 不做 / 禁止

- 改 `dream_v8_public` / local / Win / Pages / Drive
- 外部音频文件、TTS、麦克风
- 文案/注释出现私人姓名、现实门牌、私人缩写名
- 把本目录当已接线 API（`wired: false`）

---

## 7. 产出

- `SFX_CATALOG_v820.md`（本文件）
- `snippets/sfx_procedural_cues_v820.js`
- `DONE_CRITERIA_sideburn_sfx_procedural_RESULT.json`
