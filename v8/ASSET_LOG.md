# v8 ASSET_LOG

| 资产 | 路径 | 用途 | 许可/注意 |
|---|---|---|---|
| Marble 矿山小镇 | scenes/memA_fujian_town.spz (+height) | 探索枢纽 | YY Marble 导出（私有内容，试玩用） |
| 小学矿区校园 | memB_mining_school.spz | 门洞 | 同上 |
| 火星 | memC_mars_frontier.spz | 门洞 | 同上 |
| Remy 房间 | memD_remy_room.spz | 门洞室内 | 同上 |
| 教室 pack | scenes/classroom/*.glb | 门洞室内 | Grab3D CC0 |
| Kenney trees + Textures | scenes/forest/*.glb + Textures/*.png | 林间小路 | Kenney CC0（city-kit-suburban + retro-urban） |
| Rocketbox public | npc/real/c04,c05,d01–d04 | 可玩 | MIT |
| public jog clips | npc/anim/*_jog.glb | run | Quaternius UAL1 CC0 → Rocketbox 重定向，动画-only GLB |
| YY 仿真人 | dream_v8_local/npc/yy/*.glb | 仅本地 | **禁止** Pages |
| local-only humans | c02/c03/c06/d06 | 仅本地 | Renderpeople / 未核实 → 不公开 |

## v8.5 (2026-10-27)
| 资产 | 路径 | 用途 | 许可/注意 |
|---|---|---|---|
| SkeletonUtils | lib/addons/utils/SkeletonUtils.js | skinned clone | three r180 |
| UAL1 Standard | assets/characters/glb/UAL1_Standard.glb（源） | Idle/Walk/Jog 源 | Quaternius CC0 |
| retarget_anim.py | demo/v8work/anim85/ | Blender 重定向 | 输出动画-only ~90KB |
| 实体门口/矿车/山洞 | makeEntranceFacade | 场景切换 | 自建低模 |
| 近景补光 FILL | DirectionalLight | 特写质感 | — |
| forest Textures | scenes/forest/Textures/{colormap,dirt,tiles,treeA,treeB}.png | 修白模 | Kenney CC0 |

## v8.4 (2026-10-27)
| 资产 | 路径 | 用途 | 许可/注意 |
|---|---|---|---|
| 做旧贴图 rust / wood / corr / coal | index.html `OLDTEX` | 矿车站 | 程序 CanvasTexture |

## v8.6 2026-10-28 11:15:50 Asia/Shanghai
| 项 | 来源 | 许可 | 备注 |
| --- | --- | --- | --- |
| 程序化煤灰/砖石/锈铁 CanvasTexture | 自写 | 自有 | ≤512px，无外部依赖 |
| FogExp2 / SCENE_MOOD | three.js | MIT | 冷灰石青 |
| 角色模型 | Microsoft Rocketbox | MIT | 公开包不变 |
| Kenney 等 CC0（若沿用） | Kenney | CC0 | 林间等旧场景 |
公开包：无 YY 脸、无 Renderpeople。

## v8.7 2026-10-29 08:36:31 Asia/Shanghai
| 项 | 来源 | 许可 | 备注 |
| --- | --- | --- | --- |
| OLDTEX 做旧门脸扩展 | 自写 CanvasTexture | 自有 | 家/小卖/教室/小房间 |
| 枢纽密度道具 | 自写 | 自有 | 路灯煤堆废铁木栏 |
| 童年小游戏 | minigames.js 既有 | 自有+Rocketbox | 枢纽挂点 |
| 角色 | Microsoft Rocketbox | MIT | 公开包不变 |
公开包：无 YY 脸、无 Renderpeople。
