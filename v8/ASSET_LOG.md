# v8 ASSET_LOG

| 资产 | 路径 | 用途 | 许可/注意 |
|---|---|---|---|
| Marble 矿山小镇 | scenes/memA_fujian_town.spz (+height) | 探索枢纽 | YY Marble 导出（私有内容，试玩用） |
| 小学矿区校园 | memB_mining_school.spz | 门洞 | 同上 |
| 火星 | memC_mars_frontier.spz | 门洞 | 同上 |
| Remy 房间 | memD_remy_room.spz | 门洞室内 | 同上 |
| 教室 pack | scenes/classroom/*.glb | 门洞室内 | Grab3D CC0 |
| Kenney trees | scenes/forest/*.glb | 林间小路 | CC0 |
| Rocketbox FP02 | npc/FP02.glb | 可玩 | MIT |
| public real NPCs | npc/real/c04,c05,d01–d04 | 可玩+氛围 | 无 d05 |
| YY 仿真人 | dream_v8_local/npc/yy/*.glb | 仅本地 | **禁止** Pages |

## v8.3 (2026-10-27)
| 资产 | 路径 | 用途 | 许可/注意 |
|---|---|---|---|
| 家 / 车站 / 小卖部室内 | 代码 meshPack home/station/shop | 可走程序化室内 | 自建低模，无外部模型 |
| 枢纽实体门口 facade | makeEntranceFacade | 家门口/车站/小卖部外观 | 自建 |
| （移除）光柱 COMMUNITY | — | 不再使用 placard | — |

## v8.4 (2026-10-27)
| 资产 | 路径 | 用途 | 许可/注意 |
|---|---|---|---|
| 做旧贴图 rust / wood / corr / coal | index.html `OLDTEX`（CanvasTexture 256px） | 矿车站门脸+室内 | 代码程序生成，无外部图片，无许可问题 |
| 老站牌「矿车站」/ 告示 / 裂表盘 | `OLDTEX.sign` 512×160、`notice` 256×320、`clock` 128 | 同上 | 程序生成 |
| 矿车 + 铁轨 | `OLDTEX.cart()` + 盒体 | 同上 | 自建低模 |
| PWA 图标 | icon-192.png / icon-512.png | 添加到主屏幕 | 本地 PIL 程序生成 |
| （未用）外部 CC0 PBR | — | — | 本刀未下载任何外部贴图 |

## 缺口
- Marble/写实唯美森林、雨夜 spz：仍未入库。
- 矿山专用 Blender 房间：仍缺；本刀用程序化家室内顶上。
- 车站真实班车 / 小卖部交易 UI：未做（墙上「班车即将开通」小牌保留）。
