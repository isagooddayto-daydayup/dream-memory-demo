# v8.17 done criteria（机器可判）

生成：2026-10-29 Asia/Shanghai · 额度续打 v8.17（目标 ~81%→~95%，≥90% 只收尾）

1. **VERSION**：`dream_v8_public/VERSION` 与 runtime `V8.VERSION` / Pages `#ver` 均为 `v8.17`
2. **场景 L 机场候车**：`SC.L` + `meshPack:'airport'` 程序化白盒；`SCENE_MOOD.L`；E2E `loadScene('L')` 不崩、kids>0、walk 有地面
3. **场景 M 火星庇护所**：`SC.M` + `meshPack:'mars_shelter'` 程序化白盒；`SCENE_MOOD.M`；E2E `loadScene('M')` 不崩
4. **门洞**：`DOORS` 含且仅新增 `hub_airport`/`airport_ares`/`airport_mars_shelter`/`station_airport`/`hub_mars_shelter`/`cart_mars_shelter`；**不覆盖**既有 `cart_mars`；E2E 可 `useDoor` 进 L、进 M、回 A
5. **低画质 / 触屏**：`?lowq=1&touch=1&whitebox=1` 进 L/M 不崩；门提示可触
6. **轻量文案**：L/M 各 ≥1 告示或 banter 池（闽西梦境超现实、无 yy）；`banterSceneKey` 认 L/M
7. **可选**：打牌/军棋 AI 略加强（flag `__aiBoostV817`）；POSTFX stub 开时有 mild 曝光/雾 tint 且可关、lowq 强制关
8. **隐私**：public 树 html/js/json 零 `/yy/`；Playwright 扫描 PASS
9. **E2E**：`shots_v817/` ≥5 张（枢纽门、进机场、进火星、回枢纽、隐私/低配）；`DONE_CRITERIA_v817_RESULT.md` 逐条 + Asia/Shanghai
10. **发布**：git commit + push Pages `/v8/`；线上 VERSION=v8.17（fetch 确认）
11. **私密包**：sync `--apply --restore-roster --to-win`；Drive 子夹 `v817-20261029`（父 `1gCmUC8tX814_rQP-NWIjJwKH3A5Q69jq`）三 part+SHA256+合并说明，owner-only
12. **额度**：CheckSubscriptionUsage≥90% 则停新功能只收尾
