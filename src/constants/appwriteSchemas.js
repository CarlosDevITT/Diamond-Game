export const APPWRITE_TABLES=Object.freeze({
 WALLETS:"wallets",
 LEDGER_TRANSACTIONS:"ledger_transactions"
});

export const APPWRITE_SCHEMAS=Object.freeze({
 wallets:{
  user_id:"string",
  available_balance:"integer",
  locked_balance:"integer",
  updated_at:"datetime"
 },
 ledger_transactions:{
  user_id:"string",
  amount:"integer",
  type:"string",
  reference_id:"string",
  status:"string",
  created_at:"datetime"
 }
});

export const LEDGER_TYPE=Object.freeze({DEPOSIT:"deposit",WITHDRAW:"withdraw"});
export const LEDGER_STATUS=Object.freeze({PENDING:"pending",APPROVED:"approved",FAILED:"failed"});
