# 回忆与梦境 · v8.6 进度（魂系气质对照）

**状态**：公开 Pages 覆盖同一 v8 链接 · VERSION **v8.6**  
**更新**：2026-10-28 11:15:50 Asia/Shanghai

## 本版做了什么（观感方向，非主机级）
1. **运镜**：默认第三人称 camD=4.5、pitch=-0.26（略远略低略跟肩）；全身+纵深清楚；保留近景 Z；触屏右半屏拖视角。
2. **雾气**：枢纽/室外 FogExp2 冷灰石青（SCENE_MOOD + applySceneMood）；室内更淡；去掉塑料紫空 setClearColor。
3. **破败材质**：nosplat/网格地面煤灰脏污+砖石路径；矿车站锈铁/斑驳木/煤灰（程序化 CanvasTexture）；门脸旧感加强。
4. **冷灰光**：主光 0xc8d4dc、半球 0xb8c4cc、曝光 0.92；近景 FILL 仍可读脸。
5. **VERSION v8.6**；公开包仍无 YY 脸、无 Renderpeople。

## 证据
`/workspace/game/demo/v8work/shots_v86/`
- 01_hub_far_fog.png · 02_third_fullbody.png · 02b_third_walk.png · 03_closeup_face.png
- 04a_station_facade.png · 04b_station_interior_fog.png · 05_mobile_landscape.png
- 00_v85_compare_*.png（对照） · results.json · normal_probe.json

## 诚实缺口（做不到 / 本版不做）
- 主机级体积雾 / 体积光 / 光追 GI
- 超密石砖/PBR 超清破败贴图包（仍是程序化 ≤512 画布 + 低模）
- 魂系战斗手感、锁敌、架势条、受击演出
- splat 场景本身的材质重绘（雾/色调只能罩一层）
- 手机浏览器帧率与主机/主机模拟器不可比

## 公开链接
https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/
