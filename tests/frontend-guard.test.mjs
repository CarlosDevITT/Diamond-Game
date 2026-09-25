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
 const source=await readFile("src/games/tank/tank-engine.js","utf8");
 assert.match(source,/while\(this\.#bots\.length<wanted\)/);
 assert.match(source,/clamp\([^\n]*,1,4\)/);
});

test("active skills stay inside the game engine",async()=>{
 const source=await readFile("src/games/tank/tank-engine.js","utf8");
 const start=source.indexOf("#special(type)");
 const end=source.indexOf("#detonate(",start);
 assert.ok(start>=0&&end>start);
 const block=source.slice(start,end);
 assert.doesNotMatch(block,/requestFullscreen|exitFullscreen|fullscreenElement|document\.|window\./);
});
