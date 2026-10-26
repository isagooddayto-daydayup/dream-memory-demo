回忆与梦境 v7 · 记事NPC试玩（公开版：MIT Rocketbox + CC0 教室；本地模板对话，无付费 API）

【v7 新增】
1) 记事 NPC「阿澄」：场景 1（矿区小镇）出生点附近金环。走近按 E（手机点提示）打开聊天。
   - 人设/主线手写死；闲聊用本地模板+关键词，会引用你说过的话。
   - 好感三档：陌生 / 熟识 / 亲密（localStorage 键 dream_v7_npc_mem）。
2) 局后「这局梦境回忆」：按 M →「结束这局 · 生成梦境回忆」，或测完后点该按钮。
   - 根据本局走过的场景、小游戏、是否交谈/飞行等生成中文短笺；可复制；最近 N 张存在 dream_v7_dream_cards。

【操作】（同 v6）
点击画面锁定鼠标 · WASD 走 · Shift 跑 · 空格起飞 · Ctrl/Q 下降 · F 飞行切换
M 菜单 · 1-6 场景 · G 角色 · C 镜头 · V 第一人称 · T 溶解 · P 梦境过场 · O 传送门 · H 隐藏说明
E：优先与阿澄交谈；否则进入地上发光圈小游戏

【本地运行】
在 dream_v7_public 目录：python3 -m http.server 8797
浏览器打开 http://localhost:8797/
（不要用 file://，ES module / 场景资源需要 HTTP）

【许可】
公开版 NPC 仅 Microsoft Rocketbox（MIT）；教室 Grab3D CC0。无 YY 脸、无 Renderpeople。
