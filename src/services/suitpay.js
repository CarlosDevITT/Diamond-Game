const API_PREFIX="/api/suitpay";

async function request(path,options={}){
 const response=await fetch(`${API_PREFIX}${path}`,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data?.error||data?.message||"Falha na operação PIX.");
 return data;
}

export async function createPixInDeposit({userId,amount,name,cpf}){
 return request("/pix-in",{method:"POST",body:JSON.stringify({userId,amount,name,cpf})});
}

export async function requestPixOutWithdraw({userId,amount,cpf,name}){
 return request("/pix-out",{method:"POST",body:JSON.stringify({userId,amount,cpf,name})});
}
