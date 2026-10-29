# v8.18 done criteria（机器可判）

生成：2026-10-29 Asia/Shanghai · 额度续打 v8.18（目标 ~84%→~95%，≥90% 只收尾）

1. **VERSION**：`dream_v8_public/VERSION` 与 runtime `V8.VERSION` / Pages `#ver` 均为 `v8.18`
2. **L/M 道具**：`interior_props_LM.json` 在 public；程序化摆放 L×8 + M×8；E2E `__lmProps.L>=8` / `__lmProps.M>=8`；低画质仍可见（可减细节）
3. **L/M banter**：`banter_LM_2026-10-29.json` 24 条并入；E2E airport_L / mars_shelter_M 各档≥4 且 `__banterLMMerged>=20`（或 scenePools 可见）
4. **手感轻调**：无 SOULS_FEEL_GAP → 自研轻量：枢纽 dens 微调 + 第三人称相机略远略低一档；可开关（菜单/localStorage）；lowq 回退或减弱；诚实声明非主机级
5. **门洞**：useDoor E2E 尽量走真门（hub_airport→L、hub→M 或 L→M）；fallback 记入 result 但不阻断若 loadScene 通；POSTFX 仍可关、lowq 强制关
6. **回枢纽**：E2E 从 L/M 回 A 不崩
7. **隐私**：public 树 html/js/json 零 `/yy/`；Playwright 扫描 PASS
8. **E2E**：`shots_v818/` ≥5 张（枢纽、L 道具、M 道具、回枢纽、门/隐私）；`DONE_CRITERIA_v818_RESULT.md` 逐条 + Asia/Shanghai
9. **发布**：git commit + push Pages `/v8/`；线上 VERSION=v8.18（fetch 确认）
10. **私密包**：sync `--apply --restore-roster --to-win`；Drive 子夹 `v818-20261029`（父 `1gCmUC8tX814_rQP-NWIjJwKH3A5Q69jq`）三 part+SHA256+合并说明，owner-only
11. **额度**：CheckSubscriptionUsage≥90% 则停新功能只收尾
