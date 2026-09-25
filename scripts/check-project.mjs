import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root=process.cwd();
const scanExt=new Set([".js",".mjs",".html",".css",".json",".webmanifest",".yml",".yaml"]);
const jsExt=new Set([".js",".mjs"]);
const ignored=new Set([".git","node_modules"]);
const files=[];

async function walk(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  if(ignored.has(entry.name))continue;
  const full=join(dir,entry.name);
  if(entry.isDirectory())await walk(full);
  else if(scanExt.has(extname(entry.name))||entry.name.endsWith(".webmanifest"))files.push(full);
 }
}
await walk(root);
const conflicts=[];
for(const file of files){
 const text=await readFile(file,"utf8");
 if(/^(<<<<<<<|=======|>>>>>>>)/m.test(text))conflicts.push(relative(root,file));
}
if(conflicts.length){console.error("Merge conflict markers:",conflicts.join(", "));process.exit(1);}
const jsFiles=files.filter(f=>jsExt.has(extname(f)));
for(const file of jsFiles){
 const result=spawnSync(process.execPath,["--check",file],{stdio:"inherit"});
 if(result.status!==0){console.error("Syntax check failed:",relative(root,file));process.exit(result.status||1);}
}
console.log(`Project check OK: ${files.length} text files, ${jsFiles.length} JS modules.`);
