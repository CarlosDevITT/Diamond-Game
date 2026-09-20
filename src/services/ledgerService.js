/**
 * SERVER ONLY. Never import this module in browser bundles.
 * Requires node-appwrite and APPWRITE_SERVER_API_KEY.
 */
import {Client,TablesDB,ID,Query,Permission,Role} from "node-appwrite";
import {APPWRITE_TABLES,LEDGER_TYPE,LEDGER_STATUS} from "../constants/appwriteSchemas.js";

const client=new Client()
 .setEndpoint(process.env.APPWRITE_ENDPOINT||"https://nyc.cloud.appwrite.io/v1")
 .setProject(process.env.APPWRITE_PROJECT_ID||"diamond-game")
 .setKey(process.env.APPWRITE_SERVER_API_KEY||"");
const db=new TablesDB(client);
const databaseId=process.env.APPWRITE_DATABASE_ID||"diamond";
const now=()=>new Date().toISOString();
const positive=n=>{n=Number(n);if(!Number.isSafeInteger(n)||n<=0)throw new TypeError("amountCents must be a positive safe integer");return n};
const ref=(kind,id,userId)=>`${kind}:${id}:${userId}`;
const readPermission=userId=>[Permission.read(Role.user(userId))];

async function wallet(userId,transactionId){
 const found=await db.listRows({databaseId,tableId:APPWRITE_TABLES.WALLETS,queries:[Query.equal("user_id",[userId]),Query.limit(1)],transactionId});
 if(found.rows?.[0])return found.rows[0];
 return db.createRow({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:ID.unique(),data:{user_id:userId,available_balance:0,locked_balance:0,updated_at:now()},permissions:readPermission(userId),transactionId});
}
async function ledgerByReference(referenceId,transactionId){
 const found=await db.listRows({databaseId,tableId:APPWRITE_TABLES.LEDGER_TRANSACTIONS,queries:[Query.equal("reference_id",[referenceId]),Query.limit(1)],transactionId});
 return found.rows?.[0]||null;
}
async function ledger({userId,amount,type,referenceId,status=LEDGER_STATUS.COMPLETED},transactionId){
 return db.createRow({databaseId,tableId:APPWRITE_TABLES.LEDGER_TRANSACTIONS,rowId:ID.unique(),data:{user_id:userId,amount,type,reference_id:referenceId,status,created_at:now()},permissions:readPermission(userId),transactionId});
}
async function atomic(work){
 const tx=await db.createTransaction();
 try{const result=await work(tx.$id);await db.updateTransaction({transactionId:tx.$id,commit:true});return result}
 catch(error){try{await db.updateTransaction({transactionId:tx.$id,commit:false})}catch{}throw error}
}

export async function processDeposit({userId,amountCents,referenceId}){
 const amount=positive(amountCents);if(!userId||!referenceId)throw new TypeError("userId and referenceId are required");
 const existing=await ledgerByReference(referenceId);if(existing)return{duplicate:true,ledger:existing};
 return atomic(async transactionId=>{
  const repeated=await ledgerByReference(referenceId,transactionId);if(repeated)return{duplicate:true,ledger:repeated};
  const w=await wallet(userId,transactionId);
  const entry=await ledger({userId,amount,type:LEDGER_TYPE.DEPOSIT_PIX,referenceId},transactionId);
  await db.incrementRowColumn({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:w.$id,column:"available_balance",value:amount,transactionId});
  await db.updateRow({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:w.$id,data:{updated_at:now()},transactionId});
  return{duplicate:false,ledger:entry};
 });
}

export async function holdMatchBet({userId,matchId,amountCents}){
 const amount=positive(amountCents),referenceId=ref("hold",matchId,userId);
 const existing=await ledgerByReference(referenceId);if(existing)return{duplicate:true,ledger:existing};
 return atomic(async transactionId=>{
  const w=await wallet(userId,transactionId);if(Number(w.available_balance)<amount)throw new Error("INSUFFICIENT_BALANCE");
  await db.decrementRowColumn({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:w.$id,column:"available_balance",value:amount,min:0,transactionId});
  await db.incrementRowColumn({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:w.$id,column:"locked_balance",value:amount,transactionId});
  const entry=await ledger({userId,amount:-amount,type:LEDGER_TYPE.MATCH_HOLD,referenceId},transactionId);
  await db.updateRow({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:w.$id,data:{updated_at:now()},transactionId});return{duplicate:false,ledger:entry};
 });
}

export async function releaseMatchBet({userId,matchId,amountCents}){
 const amount=positive(amountCents),referenceId=ref("release",matchId,userId);
 const existing=await ledgerByReference(referenceId);if(existing)return{duplicate:true,ledger:existing};
 return atomic(async transactionId=>{
  const w=await wallet(userId,transactionId);if(Number(w.locked_balance)<amount)throw new Error("INSUFFICIENT_LOCKED_BALANCE");
  await db.decrementRowColumn({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:w.$id,column:"locked_balance",value:amount,min:0,transactionId});
  await db.incrementRowColumn({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:w.$id,column:"available_balance",value:amount,transactionId});
  const entry=await ledger({userId,amount,type:LEDGER_TYPE.MATCH_RELEASE,referenceId},transactionId);
  await db.updateRow({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:w.$id,data:{updated_at:now()},transactionId});return{duplicate:false,ledger:entry};
 });
}

export async function settleMatchPayout({winnerId,loserId,matchId,potCents,rakePercent}){
 const pot=positive(potCents),rate=Number(rakePercent);if(!winnerId||!loserId||winnerId===loserId||!matchId)throw new TypeError("Invalid settlement participants");
 if(!Number.isFinite(rate)||rate<0||rate>100)throw new RangeError("rakePercent must be between 0 and 100");
 const settlementRef=`settle:${matchId}`,existing=await ledgerByReference(`${settlementRef}:winner`);if(existing)return{duplicate:true,ledger:existing};
 const rake=Math.round(pot*rate/100),payout=pot-rake;
 return atomic(async transactionId=>{
  const winner=await wallet(winnerId,transactionId),loser=await wallet(loserId,transactionId);
  const winnerLocked=Math.floor(pot/2),loserLocked=pot-winnerLocked;
  if(Number(winner.locked_balance)<winnerLocked||Number(loser.locked_balance)<loserLocked)throw new Error("INSUFFICIENT_LOCKED_BALANCE");
  await db.decrementRowColumn({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:winner.$id,column:"locked_balance",value:winnerLocked,min:0,transactionId});
  await db.decrementRowColumn({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:loser.$id,column:"locked_balance",value:loserLocked,min:0,transactionId});
  await db.incrementRowColumn({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:winner.$id,column:"available_balance",value:payout,transactionId});
  await ledger({userId:winnerId,amount:payout,type:LEDGER_TYPE.MATCH_WIN_PAYOUT,referenceId:`${settlementRef}:winner`},transactionId);
  await ledger({userId:loserId,amount:-loserLocked,type:LEDGER_TYPE.MATCH_WIN_PAYOUT,referenceId:`${settlementRef}:loser`},transactionId);
  if(rake>0)await ledger({userId:winnerId,amount:-rake,type:LEDGER_TYPE.PLATFORM_RAKE,referenceId:`${settlementRef}:rake`},transactionId);
  const stamp=now();await db.updateRow({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:winner.$id,data:{updated_at:stamp},transactionId});await db.updateRow({databaseId,tableId:APPWRITE_TABLES.WALLETS,rowId:loser.$id,data:{updated_at:stamp},transactionId});
  return{duplicate:false,potCents:pot,rakeCents:rake,payoutCents:payout};
 });
}
