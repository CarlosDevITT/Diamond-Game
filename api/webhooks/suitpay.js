/**
 * SuitPay webhook foundation.
 * IMPORTANT: provider credentials and Appwrite API key stay server-side only.
 * Wire this handler to the project's server/serverless runtime before enabling finance.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { processDeposit } from "../../src/services/ledgerService.js";

const ACCEPTED_STATUS=new Set(["PAID_OUT","APPROVED"]);

function safeEqual(a,b){
 const aa=Buffer.from(String(a||"")),bb=Buffer.from(String(b||""));
 return aa.length===bb.length&&timingSafeEqual(aa,bb);
}

function verifyWebhook(rawBody,signature){
 const secret=process.env.SUITPAY_WEBHOOK_SECRET;
 if(!secret||!signature)return false;
 const expected=createHmac("sha256",secret).update(rawBody).digest("hex");
 return safeEqual(expected,signature);
}

export default async function handler(req,res){
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 const rawBody=typeof req.body==="string"?req.body:JSON.stringify(req.body||{});
 const signature=req.headers["x-suitpay-signature"]||req.headers["x-webhook-signature"];
 if(!verifyWebhook(rawBody,signature))return res.status(401).json({error:"Invalid webhook signature"});

 const payload=typeof req.body==="string"?JSON.parse(req.body):req.body;
 const status=String(payload?.status||"").toUpperCase();
 if(!ACCEPTED_STATUS.has(status))return res.status(202).json({received:true,ignored:true});

 const referenceId=payload?.id||payload?.transactionId||payload?.reference_id;
 if(!referenceId)return res.status(400).json({error:"Missing transaction reference"});

 const userId=payload?.userId||payload?.user_id||payload?.metadata?.userId;
 const amountCents=Number(payload?.amountCents??payload?.amount_cents);
 if(!userId||!Number.isSafeInteger(amountCents)||amountCents<=0)return res.status(400).json({error:"Invalid settlement payload"});

 try{
  const result=await processDeposit({userId,amountCents,referenceId:String(referenceId)});
  return res.status(200).json({received:true,processed:!result.duplicate,duplicate:!!result.duplicate});
 }catch(error){
  console.error("SuitPay deposit settlement failed",error);
  return res.status(500).json({received:true,error:"Settlement failed"});
 }
}
