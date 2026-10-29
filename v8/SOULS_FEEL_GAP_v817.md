# 魂系观感差距 · SOULS_FEEL_GAP_v817

- 日期：2026-10-29 09:48 Asia/Shanghai
- 范围：**仅 v8work 旁路分析**；本文件**不改** `dream_v8_public` / local / Pages / Drive
- 对照源（只读）：
  - `dream_v8_public/index.html`（v8.6+ 雾/光/相机；当前 VERSION **v8.17**）
  - `dream_v8_public/dream_v8_world.js` 头注释「魂系气质: fog/camera/cold light」
  - `v8work/DONE_CRITERIA_v86.md` + `v8work/shots_v86/`（results / normal_probe / 01–04 截图）
  - `v8work/POSTFX_MOBILE_2026-10-29.md`（后处理代价，未主机级）
- YY 视频号目标（非刷镰刀）：**第三人称略远略低、冷灰雾、破败感、冷灰光**
- 诚实上限：WebGL + 手机优先 + FogExp2 + CSS vignette；**达不到**主机魂系体积雾/材质密度/镜头弹簧

---

## 0. 当前实测常量（public v8.17，与 v8.6 同骨架）

| 项 | 现值 | 来源 |
|----|------|------|
| CAMS[0] | `third`（标签「第三人称·魂系」） | index ~739 |
| P.camD / P.pitch | **4.5** / **-0.26** | index `const P=…` |
| third 距离下限 | `Math.max(3.6, P.camD)` → 默认 4.5 | update camera |
| third 俯视钳制 | `pt = min(pitch, -0.18)`；`_cam.y -= 0.12` | update camera |
| look 高度 | `eye*0.52`（躯干中段） | update camera |
| fog | `THREE.FogExp2`；hub A dens **0.034** fog **0x646e76** clear **0x566066** exp **0.90** | SCENE_MOOD |
| 全局 HEMI / SUN | HEMI `0xb8c4cc`/`0x3a3e3c` i=0.42；SUN `0xd6e0e8` i=2.15；SCENE_LIGHT.A sun `0xc8d4dc` | index ~862–870 |
| FILL | 构造 `0xfff0e4` 0.35；运行 third **0.28** / close **1.85** | **偏暖**补光 |
| tonemap | ACES + init exp **0.92** | |
| CSS | `#vig` 冷暗角；`#tint` 冷灰 `#a8b4bc→#6a7880` opacity .22 | |
| shots_v86 mood | camD=4.5 pitch=-0.26 sun=c8d4dc hemi=b8c4cc fog dens≈0.032 | results.json / normal_probe |

截图观感（人工读图）：`01_hub_far_fog` 冷灰虚空+斑驳地面；`02_third_fullbody` 背身全身入画、偏暗；`04b_station_interior_fog` 候车棚冷湿、雾感可读。相对 v8.5 紫空已告别。

---

## 1. 已对齐（相对 YY 目标的「方向正确」项）

每项一句**可机器验收**标准。

1. **默认第三人称略远** — `CAMS[0]==='third' && P.camD>=4.5 && (third 分支 cd=Math.max(3.6,P.camD))` 在 index 中同时成立。
2. **略低略俯** — third 分支存在 `_cam.y-=0.12` 且 `pt=Math.min(pt,-0.18)`，默认 `P.pitch<=-0.26`。
3. **冷灰雾类型** — `scene.fog` 由 `new THREE.FogExp2` 创建；`SCENE_MOOD.A.fog` 解析后 R≈G≈B（冷灰/石青，非紫）。
4. **冷 clear** — `renderer.setClearColor` 初始 `0x5a6468`；mood A clear `0x566066`（非 `0x*` 偏紫系）。
5. **冷主光** — 全局 `SUN` 色 `0xd6e0e8` 或 SCENE_LIGHT.A `0xc8d4dc`；HEMI sky `0xb8c4cc`（shots_v86 mood.sun/hemi 与之同族）。
6. **曝光克制** — ACES + `toneMappingExposure` 初值 ≤0.94；mood A exp ≤0.92。
7. **暗角/冷罩** — DOM 存在 `#vig` 与 `#tint`，tint 渐变两端为冷灰 hex（非橙粉）。
8. **雨夜加深（加分）** — `applyNightLights` / 林间雨路径会抬 dens、压 exp（G 雨 dens 倍率 ≥2），可用 `__forestFog` / `__night` 探针。
9. **非战斗镜头** — 无 lock-on / 弹反 / 武器轨；符合「非刷镰刀」产品边界（缺省即 PASS）。

---

## 2. 差距（诚实：有方向，远未主机级）

每项一句可机器验收（测「差距仍在」或「补丁后应满足」）。

1. **雾浓度偏稀（白昼 hub）** — 现状 `SCENE_MOOD.A.dens===0.034`；魂系「空气脏」目标建议 ≥0.042（仍远低于体积雾）。验收：`dens < 0.040` → 记差距。
2. **远景消隐不够** — FogExp2 无高度层/体积；splat 侧另有 `fogR` 但 mesh 场景不共享。验收：无 `Fog`+`FogExp2` 双层且无 height-fog uniform → 差距。
3. **补光偏暖破坏冷灰** — `FILL` 色 `0xfff0e4`（暖），third 仍 i=0.28。验收：`FILL.color.getHex() > 0xf0e8d8`（偏暖阈值）→ 差距。
4. **SUN 过亮洗掉破败** — hub `SUN.intensity===2.15` + `environmentIntensity≈0.7` 易「灰亮」而非「灰沉」。验收：晴昼 A 且非 rain 时 `SUN.intensity > 1.85` → 差距。
5. **机位仍偏「展示全身」而非「压迫纵深」** — camD=4.5、look=`eye*0.52`；主机常用更远+更低 look。验收：`P.camD < 5.2` 或 look 系数 `> 0.45*eye` → 相对目标仍偏近/偏高。
6. **场景冷暖不一致** — C/M 等 mood/fog 仍偏暖褐；室内白盒 sun 多 `0xffe8c8`。验收：任意 `SCENE_MOOD[k].fog` 的 R-B > 0x10 且 k∈户外探索 → 与「全程冷灰」目标有偏差（可接受为区域气质，但要标注）。
7. **破败靠白盒几何，缺材质密度** — 枢纽门脸/车站有旧感，但地面/墙少锈渍层、垃圾、湿痕 LOD。验收：无独立 `decayDecal`/`wetMap` 资源计数 ≥3 → 差距。
8. **后处理未落地** — `POSTFX` stub `enabled:false`；无 LUT/弱 bloom。验收：`POSTFX.enabled===false` 且无 EffectComposer → 差距（手机默认可保留关，但观感上限低）。
9. **镜头无弹簧/遮挡推近** — 仅地面抬升钳制。验收：无 camera collision / spring arm 函数名 → 差距。
10. **帧率观感** — shots_v86 HUD 常见 23–26 FPS；糊+抖会削弱「沉」。验收：性能属工程债，不单靠调雾解决。

**明确非目标（勿写入 v8.18 必做）**：魂系战斗、刷镰刀、主机级体积光、SSAO 默认开。

---

## 3. 下版可做（建议进 v8.18 常量小补丁 · 见 snippets）

每项一句可机器验收（补丁合入后）。

1. **hub 雾略加** — `SCENE_MOOD.A.dens` ∈ [0.040, 0.048]；I/J 车站 dens ∈ [0.046, 0.056]。
2. **冷 clear 略沉** — A.clear ∈ {`0x4a545c`,`0x505860`,`0x566066`} 且不亮于现值。
3. **相机略远略低** — 默认 `P.camD∈[5.0,5.6]`；third `_cam.y-=` ≥0.16；`pt` 钳制 ≤ -0.22；look 高度系数 ≤ `eye*0.48`。
4. **FILL 改冷灰** — `FILL` hex 落入冷灰族（如 `0xd8e2e8`），third i ≤0.22；close 仍可抬亮但色相保持冷。
5. **SUN 略压** — SCENE_LIGHT.A `i∈[1.65,1.90]`；HEMI i ≤0.40。
6. **曝光** — mood A exp ∈ [0.84, 0.90]；init exposure ≤0.90。
7. **tint/vig 微调** — `#tint` opacity ∈ [0.24, 0.30]；vig 外圈 alpha ≥0.75（CSS 字符串可 grep）。
8. **（可选旗舰）** — 按 POSTFX 草案仅 `?postfx=1` 开冷灰 LUT intensity≤0.4；`GFX.low` 强制关。

合入策略：只改常量与三行相机公式；**不做**战斗、不声称「已达主机魂系」。

---

## 4. 与 shots_v86 对照结论

- v8.6 验收清单 8 项当时 PASS（冷雾/第三人称/冷光/nosplat 地）。
- 相对 YY「视频号观感」：**方向对齐约六成，密度与破败约三成，镜头压迫约四成**（主观比例，非 KPI）。
- 最大杠杆（性价比）：**fog dens + FILL 去暖 + camD/压低 + SUN 略压**；材质破败与 Composer 是下一档成本。

---

## 5. 本任务边界

- 已写：`SOULS_FEEL_GAP_v817.md`、`snippets/souls_feel_tweaks_v818.json`、`DONE_CRITERIA_sideburn_souls_gap_RESULT.json`
- **未**改 public / 未部署 / 未上传 Drive
