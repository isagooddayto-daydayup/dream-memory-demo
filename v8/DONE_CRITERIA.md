# DONE criteria — v8.8

| # | Criterion | Result |
|---|-----------|--------|
| 1 | VERSION==='v8.8' in world.js + title/HUD/menu | **PASS** (results.boot.ver, title) |
| 2 | Hub SPOTS.A mutouren+tiaosheng; E2E enter+quit | **PASS** (e2e both active→quit cur=A) |
| 3 | hub_ares hangar + cart_ares to E; cold fog on E | **PASS** doors+fog dens 0.038/col 5a646c; meshVis in emu **unconfirmed** (loaded true, shot present) |
| 4 | NPC schedule 早/午/晚 → home/shop/station; parked join | **PASS** period→poi map; parked hook in parkCurrentChar (code) |
| 5 | Acheng MAINLINE + 【陌生/熟识/亲密】; affinity rises | **PASS** tags distinct; bumps 2→28 熟识 |
| 6 | Menu lowq: fog dens↓, shadows off, pixelRatio↓ | **PASS** fogDrop+shadowOff; prDrop N/A under ?emu=0.3 floor |
| 7 | Pages /v8/ HTTP 200 + v8.8; no YY face / Renderpeople | (deploy) public roster Rocketbox only; dead `/yy/` string in jogPathFor only |
| 8 | shots_v88/ evidence | **PASS** 11 png + acheng_tiers.json + results.json |

Evidence: `/workspace/game/demo/v8work/shots_v88/` · stamp Asia/Shanghai from run.
