import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Tank entry keeps casual and authoritative engines separated",async()=>{
 const source=await readFile("src/games/tank/index.js","utf8");
 assert.match(source,/const casual=options\.mode!=="1v1"/);
 assert.match(source,/TankEngine/);
 assert.match(source,/AuthoritativeTankEngine/);
});

test("viewport owns canvas resize and camera follow",async()=>{
 const source=await readFile("src/games/tank/presentation/tank-viewport.js","utf8");
 assert.match(source,/ResizeObserver/);
 assert.match(source,/follow\(\)/);
 assert.doesNotMatch(source,/fullscreenElement|requestFullscreen|skill|#bots/);
});

test("fullscreen is presentation-only",async()=>{
 const source=await readFile("src/games/tank/presentation/fullscreen-controller.js","utf8");
 assert.match(source,/requestFullscreen/);
 assert.doesNotMatch(source,/TankEngine|camera|viewport|skill|canvas/);
});

test("casual progression supports multiple bots",async()=>{
 const engine=await readFile("src/games/tank/tank-engine.js","utf8");
 const progression=await readFile("src/games/tank/casual/bot-progression.js","utf8");
 assert.match(engine,/this\.#botProgression\.sync/);
 assert.match(progression,/while\(ctx\.bots\.length<wanted\)/);
 assert.match(progression,/,1,4\)/);
 assert.doesNotMatch(progression,/requestFullscreen|document\.|window\.|canvas|ResizeObserver/);
});

test("active skills are isolated from engine presentation",async()=>{
 const engine=await readFile("src/games/tank/tank-engine.js","utf8");
 const skills=await readFile("src/games/tank/skills/skill-system.js","utf8");
 assert.match(engine,/this\.#skills\.activate\(type,this\.#skillContext\(\)\)/);
 assert.match(engine,/this\.#skills\.detonate\(p,level,this\.#skillContext\(\)\)/);
 assert.doesNotMatch(skills,/requestFullscreen|exitFullscreen|fullscreenElement|document\.|window\.|ResizeObserver/);
 assert.match(skills,/type==="bomb"/);assert.match(skills,/type==="shock"/);assert.match(skills,/type==="dash"/);
});


test("casual AI and navigation stay isolated from presentation",async()=>{
 const engine=await readFile("src/games/tank/tank-engine.js","utf8");
 const ai=await readFile("src/games/tank/casual/bot-ai.js","utf8");
 const navigation=await readFile("src/games/tank/casual/navigation.js","utf8");
 assert.match(engine,/this\.#botAI\.update/);
 assert.match(ai,/navigation\.lineClear/);
 assert.match(ai,/navigation\.path/);
 assert.match(navigation,/class BotNavigation/);
 assert.doesNotMatch(ai+navigation,/requestFullscreen|fullscreenElement|document\.|window\.|canvas|ResizeObserver/);
});


test("game platform loads game modules lazily",async()=>{
 const app=await readFile("src/app.js","utf8");
 const registry=await readFile("src/core/game-registry.js","utf8");
 const catalog=await readFile("src/core/game-catalog.js","utf8");
 assert.match(app,/registerLazy/);
 assert.doesNotMatch(app,/import \{ snakeGame \}|import \{ tankGame \}/);
 assert.match(registry,/async resolve\(id\)/);
 assert.match(catalog,/load:\(\)=>import\("\.\.\/games\/snake\/index\.js/);
 assert.match(catalog,/load:\(\)=>import\("\.\.\/games\/tank\/index\.js/);
});


test("PWA service worker registration follows current release",async()=>{
 const app=await readFile("src/app.js","utf8");
 const sw=await readFile("sw.js","utf8");
 const registration=app.match(/register\("\.\/sw\.js\?v=(\d+)"\)/);
 const cache=sw.match(/diamond-pwa-v(\d+)/);
 assert.ok(registration&&cache);
 assert.equal(registration[1],cache[1]);
});


test("Tank logical world does not change with canvas or fullscreen size",async()=>{
 const viewport=await readFile("src/games/tank/presentation/tank-viewport.js","utf8");
 const engine=await readFile("src/games/tank/tank-engine.js","utf8");
 assert.match(viewport,/this\.view\.width=worldWidth;this\.view\.height=worldHeight/);
 assert.doesNotMatch(viewport,/this\.view\.width=Math\.min|this\.view\.height=Math\.min/);
 assert.match(engine,/this\.#viewW=this\.#viewport\.view\.width;this\.#viewH=this\.#viewport\.view\.height/);
 assert.doesNotMatch(engine,/viewport\.start\(\(\{width,height\}\)/);
});


test("mobile fullscreen requests landscape without touching gameplay",async()=>{
 const fullscreen=await readFile("src/games/tank/presentation/fullscreen-controller.js","utf8");
 const css=await readFile("assets/styles.css","utf8");
 assert.match(fullscreen,/screen\.orientation\?\.lock/);
 assert.match(fullscreen,/lock\("landscape"\)/);
 assert.match(fullscreen,/is-mobile-fullscreen/);
 assert.match(css,/Tank mobile immersive fullscreen v96/);
 assert.match(css,/touch-action:none/);
 assert.doesNotMatch(fullscreen,/TankEngine|camera|viewport|skill|projectile|bot/);
});


test("online Tank keeps selected duration and a single authoritative result flow",async()=>{
 const app=await readFile("src/app.js","utf8");
 const tank=await readFile("src/games/tank/index.js","utf8");
 const server=await readFile("src/services/game-server.js","utf8");
 assert.match(server,/desiredDurationSeconds:this\.desiredDurationMs\?this\.desiredDurationMs\/1000/);
 assert.match(app,/activeDurationMs/);
 assert.match(app,/game:server-finished/);
 assert.match(tank,/game:server-finished/);
 assert.match(tank,/desiredDurationMs:options\.durationMs/);
});


test("1v1 host startup cannot race the Appwrite countdown subscription",async()=>{
 const app=await readFile("src/app.js","utf8");
 assert.match(app,/const isHost=match\?\.room\?\.hostUserId===match\?\.userId;if\(isHost\)return/);
 assert.match(app,/if\(options\.matchId\)activeMatchId=options\.matchId/);
});

test("Tank skill buttons suppress browser zoom gestures",async()=>{
 const controls=await readFile("src/games/tank/tank-controls.js","utf8");
 assert.match(controls,/this\.#canvas\.style\.touchAction="none"/);
 assert.match(controls,/button\.style\.touchAction="none"/);
 assert.match(controls,/setPointerCapture/);
 assert.match(controls,/dblclick/);
});

test("online Tank result renders authoritative server score",async()=>{
 const tank=await readFile("src/games/tank/index.js","utf8");
 assert.match(tank,/Array\.isArray\(payload\.score\)/);
 assert.match(tank,/resultado validado pelo servidor/);
});

test('server result owns 1v1 finish while Appwrite is delayed fallback',()=>{
 const app=read('src/app.js');
 assert.match(app,/source:"server"/);
 assert.match(app,/source:"appwrite-fallback"/);
 assert.match(app,/},1200\);/);
 assert.match(app,/clearTimeout\(resultFallbackTimer\)/);
});

test('result lobby return awaits presence cleanup before reopening lobby',()=>{
 const app=read('src/app.js');
 assert.match(app,/await match\?\.leaveRoom\?\.\(\)/);
 assert.match(app,/await registry\.close\(stage\)/);
});

test('game server exposes local socket reconnect lifecycle',async()=>{
 const server=await readFile("src/services/game-server.js","utf8");
 const engine=await readFile("src/games/tank/tank-authoritative-engine.js","utf8");
 assert.match(server,/connectionEvents=new Set\(\["connect","disconnect","connect_error"\]\)/);
 assert.match(engine,/onConnectionLost/);
 assert.match(engine,/onConnectionRestored/);
});

test('Tank transient reconnect keeps authoritative session alive',async()=>{
 const tank=await readFile("src/games/tank/index.js","utf8");
 assert.match(tank,/Reconectando à partida/);
 assert.match(tank,/estado continuam no servidor/);
 assert.match(tank,/engine\.onConnectionRestored/);
});

test('active 1v1 can be rediscovered after PWA reload without local gameplay state',async()=>{
 const client=await readFile("src/core/match-client.js","utf8");
 const app=await readFile("src/app.js","utf8");
 assert.match(client,/restoreActiveRoom/);
 assert.match(client,/\["countdown","playing"\]\.includes\(room\.status\)/);
 assert.match(app,/resumed:true/);
 assert.doesNotMatch(client,/localStorage|sessionStorage/);
});

test('Tank Q and E skills are isolated from browser keyboard behavior',async()=>{
 const controls=await readFile("src/games/tank/tank-controls.js","utf8");
 assert.match(controls,/KeyQ/);
 assert.match(controls,/KeyE/);
 assert.match(controls,/e\.code==="KeyQ"\|\|e\.code==="KeyE"\)e\.stopPropagation/);
 assert.doesNotMatch(controls,/stopImmediatePropagation/);
 assert.doesNotMatch(controls,/capture:true/);
 assert.match(controls,/e\.ctrlKey\|\|e\.altKey\|\|e\.metaKey/);
});

test('Tank movement keys remain in normal keyboard flow',async()=>{
 const controls=await readFile("src/games/tank/tank-controls.js","utf8");
 assert.match(controls,/this\.#keys\.add\(e\.key\)/);
 assert.match(controls,/k\.has\("w"\).*k\.has\("W"\).*ArrowUp/);
 assert.match(controls,/k\.has\("a"\).*k\.has\("A"\).*ArrowLeft/);
 assert.match(controls,/k\.has\("d"\).*k\.has\("D"\).*ArrowRight/);
 assert.match(controls,/k\.has\("s"\).*k\.has\("S"\).*ArrowDown/);
});

test('Tank custom mobile controls keep portrait and landscape layouts independent',async()=>{
 const controls=await readFile("src/games/tank/tank-controls.js","utf8");
 const css=await readFile("assets/styles.css","utf8");
 assert.match(controls,/diamond:tank-controls:v2/);
 assert.match(controls,/orientationKey/);
 assert.match(controls,/portrait/);
 assert.match(controls,/landscape/);
 assert.match(css,/Tank orientation-safe mobile controls v105/);
 assert.match(css,/@media \(orientation:portrait\) and \(pointer:coarse\)/);
 assert.match(css,/@media \(orientation:landscape\) and \(pointer:coarse\)/);
});

test('Tank viewport keeps renderer view synchronized after resize and skills',async()=>{
 const viewport=await readFile("src/games/tank/presentation/tank-viewport.js","utf8");
 const engine=await readFile("src/games/tank/tank-engine.js","utf8");
 assert.match(viewport,/viewWidth:this\.view\.width,viewHeight:this\.view\.height/);
 assert.match(engine,/this\.#viewW=viewWidth;this\.#viewH=viewHeight/);
 assert.doesNotMatch(await readFile("src/games/tank/skills/skill-system.js","utf8"),/camera|viewport|scale\(/);
});

test('Tank renderer cannot create non-uniform skill zoom',async()=>{
 const renderer=await readFile("src/games/tank/tank-renderer.js","utf8");
 const engine=await readFile("src/games/tank/tank-engine.js","utf8");
 const skills=await readFile("src/games/tank/skills/skill-system.js","utf8");
 assert.match(renderer,/scale=Math\.min\(cw\/vw,ch\/vh\)/);
 assert.match(renderer,/ctx\.scale\(scale,scale\)/);
 assert.doesNotMatch(renderer,/ctx\.scale\(sx,sy\)/);
 assert.match(engine,/this\.#viewW=this\.#viewport\.view\.width;this\.#viewH=this\.#viewport\.view\.height;drawTankArena/);
 assert.doesNotMatch(skills,/camera|viewport|requestFullscreen|style\.transform|ctx\.scale/);
});

test('PWA entry chain cannot serve stale Tank runtime after fixes',async()=>{
 const catalog=await readFile("src/core/game-catalog.js","utf8");
 const app=await readFile("src/app.js","utf8");
 const sw=await readFile("sw.js","utf8");
 const html=await readFile("index.html","utf8");
 assert.match(catalog,/tank\/index\.js\?v=20260928-107/);
 assert.match(sw,/diamond-pwa-v107/);
 assert.match(sw,/app\.js\?v=20260928-107/);
 assert.match(html,/app\.js\?v=20260928-107/);
 assert.match(app,/sw\.js\?v=107/);
 assert.doesNotMatch(sw,/diamond-pwa-v101/);
});

test('legacy Tank layout generations stay removed',async()=>{
 const css=await readFile("assets/styles.css","utf8");
 for(const legacy of ["Tank mobile UX v2","Tank mobile split layout v3","Tank mobile arena/control balance v4","Tank desktop fullscreen: presentation only v88","Tank mobile landscape-first gameplay v79","Tank mobile immersive fullscreen v96"]) assert.ok(!css.includes(legacy),legacy);
 assert.match(css,/Tank presentation contract v108/);
});
