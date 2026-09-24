export const TANK_SKILLS=Object.freeze([
 {id:"rapid",name:"Cadência",description:"Reduz o intervalo entre disparos",maxLevel:5,baseCost:80,costStep:60},
 {id:"armor",name:"Blindagem",description:"Mais vida e resistência",maxLevel:5,baseCost:80,costStep:60},
 {id:"speed",name:"Turbo",description:"Aumenta velocidade e resposta",maxLevel:5,baseCost:80,costStep:60},
 {id:"power",name:"Potência",description:"Amplifica o dano dos projéteis",maxLevel:5,baseCost:80,costStep:60},
 {id:"repair",name:"Nanorreparo",description:"Regenera vida fora de perigo",maxLevel:5,baseCost:105,costStep:60},
 {id:"magnet",name:"Ímã Quântico",description:"Atrai suprimentos à distância",maxLevel:5,baseCost:80,costStep:60},
 {id:"ricochet",name:"Ricochete",description:"Projéteis rebatem nas paredes",maxLevel:5,baseCost:105,costStep:60},
 {id:"overdrive",name:"Sobrecarga",description:"Mais créditos e projéteis velozes",maxLevel:5,baseCost:80,costStep:60},
 {id:"multishot",name:"Rajada Prisma",description:"Adiciona projéteis laterais",maxLevel:5,baseCost:80,costStep:60},
 {id:"bomb",name:"Bomba Nova",description:"Ataque especial de grande área",maxLevel:5,baseCost:80,costStep:60},
 {id:"shock",name:"Pulso de Choque",description:"Desacelera o inimigo atingido",maxLevel:5,baseCost:80,costStep:60}
]);

export const createTankUpgrades=()=>Object.fromEntries(TANK_SKILLS.map(skill=>[skill.id,0]));

export function resolveTankSkillCatalog(serverSkills){
 const byId=new Map(TANK_SKILLS.map(skill=>[skill.id,skill]));
 if(Array.isArray(serverSkills)){
  for(const skill of serverSkills){
   if(!skill?.id)continue;
   const base=byId.get(skill.id)||{};
   byId.set(skill.id,{...base,...skill});
  }
 }
 return [...byId.values()];
}

export function tankSkillState(upgrades={},serverSkills){
 return resolveTankSkillCatalog(serverSkills).map(skill=>{
  const level=Number(upgrades?.[skill.id])||0;
  const max=Number(skill.maxLevel)||5;
  const baseCost=Number(skill.baseCost)||80;
  const costStep=Number(skill.costStep)||60;
  return{id:skill.id,name:skill.name||skill.id,description:skill.description||"",level,max,cost:baseCost+level*costStep};
 });
}
