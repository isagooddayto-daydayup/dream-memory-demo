# v8.4 done criteria (machine-checkable)

1. Pages `https://isagooddayto-daydayup.github.io/dream-memory-demo/v8/` HTTP 200; body contains `v8.4`, `v8Fullscreen`, `requestFullscreen`, `apple-mobile-web-app-capable`
2. `v8/manifest.webmanifest` HTTP 200 with `"display": "fullscreen"` + `"orientation": "landscape"`; dream_v8_world.js contains `v8.4`
3. Station weathering present: `OLDTEX` + sign text `矿车站` in index.html (hub facade + interior I)
4. Playwright Chromium mobile emulation (hasTouch) on live URL, 4 profiles (844×390, 915×412, 667×375 landscape + 390×844 portrait):
   全屏 button exists & tap raises no pageerror; all `.tb` ≥44×44; no button∩button / button∩joystick; all in viewport;
   right-half swipe changes yaw; joystick moves player; walking into 矿车站 door reaches scene I
5. Screenshots in `/workspace/game/demo/v8work/shots_v84/` (+ results.json)
6. Public package: no `yy_fb` / `npc/yy` / Renderpeople d05 in roster
7. PROGRESS.md records commit + curl evidence + Asia/Shanghai timestamps; emulator-only caveat stated
