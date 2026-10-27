# v8 ASSET_LOG

| 资产 | 路径 | 用途 | 许可/注意 |
|---|---|---|---|
| Marble 矿山小镇 | scenes/memA_fujian_town.spz (+height) | 探索枢纽 | YY Marble 导出（私有内容，试玩用） |
| 小学矿区校园 | memB_mining_school.spz | 仍可数字键进入 | 同上 |
| 火星 | memC_mars_frontier.spz | 同上 | 同上 |
| Remy 房间 | memD_remy_room.spz | 第二扇门室内 | 同上 |
| 教室 pack | scenes/classroom/*.glb | 第一扇门室内 | Grab3D CC0（见 LICENSE_*） |
| classroom_whitebox | scenes/classroom/classroom_whitebox.glb | 备用白模（已拷贝，本刀未强制加载） | 自建 |
| room.glb | scenes/room.glb | 通用室内备用 | 历史 web 资源，本刀门洞优先 Remy |
| Rocketbox FP02 | npc/FP02.glb | 可玩 | MIT |
| public real NPCs | npc/real/c04,c05,d01–d04 | 可玩+氛围 | 与 v7 公开集一致；无 d05 |
| YY 仿真人 | dream_v8_local/npc/yy/*.glb | 仅本地可玩 | **禁止** Pages/公开 Drive |
| d05 Renderpeople | local npc/real 文件在磁盘 | **未进默认 roster** | 禁止公开 |

## 缺口
- 专用「矿山房间」Blender 室内：Drive 搜「矿山房」无可用 glb/blend（2026-10-27）；下一刀继续搜或自建。
- 森林 / 雨夜 Marble 或等价 mesh：未入库本刀。

## v8.1 (2026-10-27)
- 无新增外部资产；复用 memB_mining_school / memC_mars_frontier 既有 spz+height。
- 门洞标签：山洞·矿区校园、洞穴·火星边疆。

## v8.2 (2026-10-27)
| 资产 | 路径 | 用途 | 许可/注意 |
|---|---|---|---|
| Kenney trees (suburban + retro urban) | scenes/forest/*.glb | 林间小路迷你森林 | CC0（见 LICENSE_kenney_cc0.txt）；非 Marble 写实 |
| 社区标记 | 代码 COMMUNITY | 家门口/矿车站/小卖部告示 | 自建光柱，无外部模型 |
| 角色卡 | localStorage dream_v8_charcards | 经历/技能占位 | 浏览器本地 |

## 缺口
- Marble/写实唯美森林、雨夜 spz：仍未入库；本刀用 Kenney 低配可走林区顶上。
- 矿山专用 Blender 房间：仍缺。
- 车站真实交通节点 / 小卖部交互：仅告示骨架。
