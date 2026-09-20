/**
 * SuitPay webhook foundation.
 * IMPORTANT: provider credentials and Appwrite API key stay server-side only.
 * Wire this handler to the project's server/serverless runtime before enabling finance.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

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

 // TODO server-only Appwrite transaction:
 // 1. Query ledger_transactions by unique reference_id.
 // 2. If it exists, return 200 (idempotent replay).
 // 3. Validate provider amount/user metadata against the pending operation.
 // 4. Create immutable ledger entry.
 // 5. Atomically update wallets.available_balance / locked_balance.
 // Do not enable financial credits until this transaction boundary is implemented.
 return res.status(501).json({received:true,error:"Ledger settlement not enabled yet"});
}
