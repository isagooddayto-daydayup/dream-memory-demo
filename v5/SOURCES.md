# dream_proto (dream1) — 素材来源与授权

| 内容 | 文件 | 来源 | 授权 |
|---|---|---|---|
| Spark 2.3.1 (World Labs, Gaussian splat 渲染/dyno/SparkPortals/SplatSkinning) | lib/spark.module.js | npm @sparkjsdev/spark@2.3.1, https://github.com/sparkjsdev/spark | MIT (lib/LICENSE_spark.txt) |
| three.js r180 + GLTFLoader/BufferGeometryUtils/Pass | lib/three*.js, lib/addons | npm three@0.180.0 | MIT |
| three-vrm 2.1.0 (与 Gaussian-VRM 官方 demo 同版本，保证顶点索引一致) | lib/three-vrm.module.js | npm @pixiv/three-vrm@2.1.0 | MIT |
| 高斯真人化身 sample4（女性，红长袖+背带围裙） | avatar/sample4.{bin,json,vrm} | Gaussian-VRM, Naruya Kondo 等, https://github.com/naruya/gaussian-vrm ; 官方样例云盘 https://drive.google.com/drive/folders/1R9QXjUiDZf0vo7E4GnmnvyB_KB9-N2F8 （该文件夹含 sample4–9；sample4.png 与仓库版 md5 一致） | README 原文：“These avatars are released under the MIT License, as long as they are not used in ways that violate public order or morality.” 本包把 sample4.gvrm 里的 ply/data.json 转成了 avatar/sample4.bin（仅格式转换），model.vrm 原样保留。|
| 化身里的 VRM 骨架 (sotai.vrm 派生) | avatar/sample4.vrm | JOKER's store (https://jokerconentsshop.booth.pm/) | 作者声明：可用于任何用途，但不得单独再分发未修改的原模型。这里它是 GVRM 样例的一部分、已拟合到扫描体型，不单独分发。|
| 未使用 | Gaussian-VRM 仓库 assets/*.fbx (Mixamo 动作) 及 sample1–3、author.gvrm | — | README 写明 assets 目录“仅供研究、未经许可不得使用/修改/再分发”，所以没用。动作全部是代码程序化生成。|
| 回忆一：Fujian_Mining_Town_1980s | scenes/memA_fujian_town.spz, memA_portalview.spz, memA_height.json | YY 云盘（Marble 生成，2026-10-19 上传） | YY 自有 / 按 World Labs Marble 条款 |
| 回忆二：小学矿区校园 | scenes/memB_mining_school.spz, memB_portalview.spz, memB_height.json | v13 的 mining.splat（源自 YY 云盘 小学矿区校园_视觉点云.spz，90 万点降采样），转成 spz | 同上 |
| 过场动画 | cutscenes/ , cutscenes.html | 另一个工作流程加入，来自 YY 云盘 AI 生成片段（见 cutscenes/manifest.json） | 按 YY 自有素材 |

*_portalview.spz 是我用体素合并做的低点数副本（约 22–30 万点），只用于从另一段回忆透过传送门看过去。

## dream2 NPCs (npc/)
- FP02.glb, M07.glb, MITA.glb — rigged models already in YY's Drive 3D library (copied from web_v13/chars, same UE-style skeleton). FP02 = Microsoft Rocketbox (MIT). M07 / MITA: license as recorded in the original Drive/web_v13 source notes — NOT re-verified here; replace before any public release if unsure.
- Animation: procedural idle / walk / turn-to-face-player / wave (pose engine ported from web_v13), no third-party animation files.

## dream2 additions
- Player roster (G / M menu): heroine.glb ×2 outfits (小琳/阿美), hinako.glb, F02.glb, FP02, M07, MITA — from YY's Drive / web_v13. FP02 = Microsoft Rocketbox (MIT); others: Drive sources, licences unverified (as in web_v13 CREDITS). Gaussian-VRM sample4 avatar kept, only with ?gs.
- Scene C memC_mars_frontier.spz: YY's Drive "Marble_Mars_Frontier_full_1920000.spz" (World Labs Marble export), pruned to 1.15M splats.
- Scene D memD_remy_room.spz: web_v13 remy.splat (YY's existing asset; origin as recorded in v13), converted to spz.
- Scene E scenes/ares/*: ARES Mars base, YY's own Blender project export + its Marble panorama sky (from web_v13).
- Animation: procedural pose engine (from web_v13), no third-party animation files.
