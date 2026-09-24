import { Client, Account, TablesDB, ID, Query, Permission, Role } from "https://cdn.jsdelivr.net/npm/appwrite@21.4.0/+esm";

export const APPWRITE=Object.freeze({
 endpoint:"https://cloud.appwrite.io/v1",
 projectId:"diamond-game",
 databaseId:"diamond"
});
export const client=new Client().setEndpoint(APPWRITE.endpoint).setProject(APPWRITE.projectId);
export const account=new Account(client);
export const db=new TablesDB(client);
export {ID,Query,Permission,Role};
export async function ensureSession(){return account.get();}

export async function fetchUserMatchHistory(userId,limit=10){
 if(!userId)return[];
 const size=Math.max(1,Math.min(Number(limit)||10,50));
 const common=[Query.equal("status",["finished"]),Query.orderDesc("finished_at"),Query.limit(size)];
 const [a,b]=await Promise.all([
  db.listRows({databaseId:APPWRITE.databaseId,tableId:"matches",queries:[Query.equal("player_a",[userId]),...common]}),
  db.listRows({databaseId:APPWRITE.databaseId,tableId:"matches",queries:[Query.equal("player_b",[userId]),...common]})
 ]);
 const seen=new Map();
 [...(a.rows||[]),...(b.rows||[])].forEach(row=>seen.set(row.$id,row));
 return [...seen.values()].sort((x,y)=>new Date(y.finished_at||0)-new Date(x.finished_at||0)).slice(0,size);
}
