import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Tank entry keeps casual and authoritative engines separated",async()=>{
 const source=await readFile("src/games/tank/index.js","utf8");
 assert.match(source,/matchContext\.casual\s*\?/);
 assert.match(source,/TankEngine/);
 assert.match(source,/AuthoritativeTankEngine/);
});

test("viewport owns canvas resize and camera follow",async()=>{
 const source=await readFile("src/games/tank/presentation/tank-viewport.js","utf8");
 assert.match(source,/ResizeObserver/);
 assert.match(source,/follow\(target,dt\)/);
 assert.doesNotMatch(source,/fullscreenElement|requestFullscreen|skill|#bots/);
});

test("desktop fullscreen is presentation-only",async()=>{
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
