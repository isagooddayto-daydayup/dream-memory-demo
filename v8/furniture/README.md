# 矿山小屋家具资产包 · 2026-10-29

自建程序化低模（trimesh），**CC0-1.0**，无第三方网格、无 Renderpeople、无付费素材。

供下一刀替换 `dream_v8` 家/小卖部室内的程序化白盒。本包**未**改 `dream_v8_public`，也未进 Pages。

## 内容

| 文件 | 用途 | 约尺寸 (m, XYZ) |
|---|---|---|
| `glb/bed.glb` | 木床+床垫+枕+被 | ~2.05 × 1.15 × 0.93 |
| `glb/table.glb` | 旧木桌+抽屉暗示 | ~1.20 × 0.70 × 0.75 |
| `glb/chair.glb` | 靠背木椅 | ~0.42 × 0.40 × 0.93 |
| `glb/oil_lamp.glb` | 煤油灯（底座/灯壶/玻璃罩/火） | ~0.21 × 0.16 × 0.33 |
| `glb/radio.glb` | 旧收音机+天线+旋钮 | ~0.45 × 0.24 × 0.53 |
| `glb/calendar.glb` | 挂墙日历板 | ~0.42 × 0.05 × 0.55 |

预览：`previews/*.png`，总览 `previews/contact_sheet.png`。  
清单：`manifest.json`。  
生成脚本：`src/build_furniture.py`（可重跑）。

## 材质说明

- 顶点色（脏木色/锈色/纸色），无外部贴图依赖，three.js `GLTFLoader` 直接可用。
- 原点在地面中心附近（Z=0 贴地）；导入后按场景缩放（建议统一 ×1.0，日历挂墙时绕 X 贴墙）。

## 许可证

CC0-1.0（作者放弃权利）。可商用、可改、可不署名。

## 缺口（诚实）

- 仍是低模白盒进阶，不是扫描家具；无磨损贴图/法线。
- 预览为 matplotlib 正交色块图，非 EEVEE 影棚图（需要时可再跑 Blender 预览）。
- 未做碰撞体 / LOD；游戏内需自行加 `Box3` 或简化 collider。
