export const APPWRITE_TABLES=Object.freeze({WALLETS:"wallets",LEDGER_TRANSACTIONS:"ledger_transactions"});

export const LEDGER_TYPE=Object.freeze({
 DEPOSIT_PIX:"DEPOSIT_PIX",WITHDRAW_PIX:"WITHDRAW_PIX",MATCH_HOLD:"MATCH_HOLD",
 MATCH_RELEASE:"MATCH_RELEASE",MATCH_WIN_PAYOUT:"MATCH_WIN_PAYOUT",PLATFORM_RAKE:"PLATFORM_RAKE"
});
export const LEDGER_STATUS=Object.freeze({PENDING:"PENDING",COMPLETED:"COMPLETED",FAILED:"FAILED",CANCELLED:"CANCELLED"});

/**
 * Monetary integer fields are always BRL cents.
 * Rows are readable only by Role.user(user_id). Client write access must NOT be granted;
 * mutations are performed exclusively by the server API key.
 */
export const APPWRITE_SCHEMAS=Object.freeze({
 wallets:{
  id:"wallets",rowSecurity:true,
  columns:{
   user_id:{type:"varchar",size:36,required:true},
   available_balance:{type:"integer",required:false,default:0,unit:"cents"},
   locked_balance:{type:"integer",required:false,default:0,unit:"cents"},
   updated_at:{type:"datetime",required:true}
  },
  indexes:{idx_user_id:{type:"unique",columns:["user_id"],orders:["asc"]}},
  permissions:{read:"user:{user_id}",write:"server-only"}
 },
 ledger_transactions:{
  id:"ledger_transactions",rowSecurity:true,
  columns:{
   user_id:{type:"varchar",size:36,required:true},
   amount:{type:"integer",required:true,unit:"cents"},
   type:{type:"enum",required:true,elements:Object.values(LEDGER_TYPE)},
   reference_id:{type:"varchar",size:128,required:true},
   status:{type:"enum",required:true,elements:Object.values(LEDGER_STATUS)},
   created_at:{type:"datetime",required:true}
  },
  indexes:{
   idx_ledger_user:{type:"key",columns:["user_id"],orders:["asc"]},
   idx_reference_id:{type:"unique",columns:["reference_id"],orders:["asc"]}
  },
  permissions:{read:"user:{user_id}",write:"server-only"}
 }
});
