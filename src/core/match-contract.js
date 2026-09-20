export const MATCH_STATE=Object.freeze({WAITING:"waiting",COUNTDOWN:"countdown",PLAYING:"playing",FINISHED:"finished"});

export function resolveCompetitiveResult(a={},b={}){
 const scoreA=Math.max(0,Number(a.score)||0),scoreB=Math.max(0,Number(b.score)||0);
 const survivalA=Math.max(0,Number(a.survivalMs)||0),survivalB=Math.max(0,Number(b.survivalMs)||0);
 if(scoreA!==scoreB)return{winner:scoreA>scoreB?"A":"B",reason:"score",scoreA,scoreB,survivalA,survivalB};
 if(survivalA!==survivalB)return{winner:survivalA>survivalB?"A":"B",reason:"survival",scoreA,scoreB,survivalA,survivalB};
 return{winner:null,reason:"draw",scoreA,scoreB,survivalA,survivalB};
}

export function createCompetitiveConfig(config={}){
 return Object.freeze({enabled:true,durationMs:90000,countdownMs:3000,...config});
}
