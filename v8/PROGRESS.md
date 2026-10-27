# 梦境游戏 v8.4 进度

时间：2026-10-27 10:13:10（北京时间 / Asia/Shanghai）

## 状态总览
- **本刀 v8.4**：矿车站做旧（枢纽门脸 + 候车棚室内）；手机全屏按钮 + PWA manifest；横屏布局重排 + 安全区 + 防误触；竖屏「横屏更好玩」提示
- **发布**：**已确认**（Pages 200，含 v8.4 / v8Fullscreen / manifest）
- **验证**：Playwright Chromium 手机模拟（hasTouch）4 机型全过；**仅模拟器，真机（iOS Safari 全屏行为、帧率）未验**
- **公开包**：无 YY 脸、无 Renderpeople d05

## 做了什么
1. 做旧贴图 `OLDTEX`（代码 CanvasTexture ≤512px）：锈铁、斑驳木板、波纹铁皮+锈流痕、煤灰、褪色老站牌「矿车站 / KUANG CHE ZHAN · 1987」（掉漆、锈角）、旧告示、裂表盘、矿车
2. 候车棚室内 I：木站台、铁轨+枕木、两辆矿车、锈柱、塌一角的铁皮顶、歪木条后墙、老灯泡、灰尘；进站朝向站牌
3. 枢纽门脸：锈柱、下垂铁皮雨棚、木板墙、老站牌、链条、短铁轨+矿车
4. 手机：左上「⛶ 全屏」（requestFullscreen/webkit + screen.orientation.lock('landscape')，失败不报错；iOS 弹「分享 → 添加到主屏幕」）；manifest.webmanifest（fullscreen/landscape）+ apple-mobile-web-app-capable + 图标
5. 横屏布局：右下 3×3 按钮（52px，间距 10px）、左下 140px 摇杆、上角 全屏/菜单/结束这局；env(safe-area-inset-*)；HUD 触屏隐藏、桌面 12 秒淡出
6. 防误触：touch-action/overscroll/user-select/touch-callout；阻止双击缩放、手势缩放、长按菜单；按钮 400ms 去重（修复一按触发 2–3 次导致菜单/飞行自己关掉）
7. 进门：出门后需先离开门范围才重新「上膛」，出门落点 2.9m 外，避免刚出又被吸回

## 模拟器验证（live Pages，2026-10-27 10:13:10 北京时间）
- 机型：844×390（iPhone 13 横）、915×412（Pixel 7 横）、667×375（iPhone SE 横）、390×844（iPhone 13 竖）；全部 hasTouch + isMobile
- 全部 12 个按钮 ≥52×52；按钮互不重叠、不压摇杆（最小间距 10px）；全在视口内
- 点「全屏」：无 pageerror；Chromium 进入全屏，锁横屏 NotSupportedError 已被吞掉
- 右半屏左滑 120px → yaw +0.78 rad；摇杆前推 1.6s → 移动约 4m
- 站在矿车站门前 3.2m 推摇杆 → 约 3.9s 进入 I；倒退走出 → 回 A，3.5s 后仍在 A（不回吸）
- 「菜单」一按即开、「角色」一按只换 1 位
- 测试用 ?emu=1&nosplat=1（软件 GL 下 Gaussian splat 仅约 1 FPS，功能检查时不加载枢纽 splat 背景）；另有一组完整 splat 截图
- 截图：/workspace/game/demo/v8work/shots_v84/

## 缺口（诚实）
- 真机未测：iOS Safari 不支持网页全屏（只能添加到主屏幕）；真机帧率未知
- 667px 宽横屏：开局 7 秒的说明条会换行压住门提示，淡出后正常
- 家门口/小卖部尚未做旧；班车与小卖部交易未做

## 发布（证据）
- 试玩：https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/
- 功能 commit `431f716`（431f7161db713f06c61a8302e2b050f984da42f7，2026-10-27 10:06:24 北京时间）
- Pages last-modified 2026-10-27 10:07:11 北京时间；10:07:17 探测：index/world/manifest/icon 均 200，含 v8.4、v8Fullscreen、requestFullscreen、orientation.lock、apple-mobile-web-app-capable、OLDTEX、矿车站；manifest display=fullscreen、orientation=landscape；world 无 npc/yy
