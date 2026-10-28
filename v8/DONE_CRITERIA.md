# v8.6 done criteria (machine-checkable) — deadline 2026-10-28 15:00 Asia/Shanghai

1. VERSION==='v8.6' in dream_v8_world.js + index HUD/menu text
2. Default CAMS[0]==='third'; camera dist≥3.6, height≤1.35, lookY≤1.15 (soulslike pull-back); close (Z) still works
3. scene.fog is THREE.FogExp2 or Fog; hub/outdoor fog color cold gray-teal (not purple); setClearColor cold
4. nosplat hub ground has textured material (map or canvas dirt/coal), not flat purple void
5. SUN color cold (blue-ish white), HEMI cold; FILL in close mode still bright enough for face
6. Playwright shots_v86/: ① hub far ② third full-body ③ close face ④ station+fog ⑤ mobile landscape layout; + optional v85 compare
7. Pages /v8/ HTTP 200 body contains v8.6; public no yy_fb / npc/yy assets
8. PROGRESS.md Asia/Shanghai stamp + honest gaps (no volumetric fog / dense stone / combat feel)

## 验收记录 2026-10-28 11:15:50 Asia/Shanghai
1. VERSION v8.6 — PASS（world.js + HUD）
2. camD=4.5 pitch=-0.26 third — PASS（results.json / normal_probe.json）
3. FogExp2 + cold clear — PASS（code + shots 01/04）
4. nosplat textured ground — PASS（shots 01/02 vs 00_v85）
5. cold SUN/HEMI + close FILL — PASS（mood probe sun=c8d4dc）
6. shots_v86 ①–⑤ — PASS（9 png）
7. Pages — pending deploy this stamp
8. PROGRESS gaps — PASS（PROGRESS.md 诚实缺口）
