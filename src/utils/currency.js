const BRL=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});

export function centsToBRL(cents){
 const n=Number(cents);
 if(!Number.isSafeInteger(n))throw new TypeError("cents must be a safe integer");
 return BRL.format(n/100);
}

export function brlToCents(value){
 if(typeof value==="number"){
  if(!Number.isFinite(value))throw new TypeError("Invalid BRL value");
  return Math.round(value*100);
 }
 let raw=String(value??"").trim().replace(/R\$|\s/g,"");
 if(!raw)return 0;
 if(raw.includes(","))raw=raw.replace(/\./g,"").replace(",",".");
 const n=Number(raw);
 if(!Number.isFinite(n))throw new TypeError("Invalid BRL value");
 return Math.round(n*100);
}

export function formatCentsInput(value){
 const digits=String(value??"").replace(/\D/g,"");
 const cents=digits?Number.parseInt(digits,10):0;
 return centsToBRL(cents);
}
