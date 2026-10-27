# v8.5 done criteria (machine-checkable)

1. Pages `…/dream-memory-demo/v8/` HTTP 200; body contains `v8.5`, `toggleClose`, `parkCurrentChar`, `rideStart`/`RIDE`, no floating portal default (`portalOn=Q.has('portal')`)
2. dream_v8_world.js: `VERSION==='v8.5'`, 9 DOORS, ROSTER_PUBLIC 6 Rocketbox only, NPC_LOCAL=[]
3. Public package: no `yy_fb` / `npc/yy/` files; no Renderpeople d05/c01/c02/c03/c06/d06 in roster or shipped glbs under npc/
4. Playwright evidence in `/workspace/game/demo/v8work/shots_v85/`:
   ① idle non-T (mixer + bone quat change) ② walk/run weights ③ switch parks previous with mixer
   ④ station→cart ride→Mars ⑤ home door ⑥ cave/mine ⑦ close-up face ⑧ local YY (not public)
   + `demo_01to06.mp4` ≤30s + `normal_mode_probe.json` mixer_advances && bone_changes
5. Private Windows tree under `/workspace/game/offline/` with ~90MB parts + 合并说明; uploaded only to YY Google Drive (not shared)
6. PROGRESS.md: commit + curl Pages evidence + Asia/Shanghai stamps; honest gaps
