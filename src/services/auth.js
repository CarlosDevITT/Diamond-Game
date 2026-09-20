import { account, db, APPWRITE, ID, Query, Permission, Role } from "./appwrite.js";
export class AuthService {
 async current(){try{return await account.get()}catch{return null}}
 async signUp({name,email,password}){
  const user=await account.create({userId:ID.unique(),email,password,name});
  await account.createEmailPasswordSession({email,password});
  await this.ensureProfile(user,name); return account.get();
 }
 async signIn({email,password}){await account.createEmailPasswordSession({email,password});const user=await account.get();await this.ensureProfile(user,user.name||email.split("@")[0]);return user}
 async signOut(){await account.deleteSession({sessionId:"current"})}
 async ensureProfile(user,name){
  const found=await db.listRows({databaseId:APPWRITE.databaseId,tableId:"profiles",queries:[Query.equal("user_id",[user.$id]),Query.limit(1)]});
  if(found.rows?.length)return found.rows[0];
  return db.createRow({databaseId:APPWRITE.databaseId,tableId:"profiles",rowId:ID.unique(),data:{user_id:user.$id,username:(name||"Jogador").slice(0,40),status:"online"},permissions:[Permission.read(Role.any()),Permission.update(Role.user(user.$id)),Permission.delete(Role.user(user.$id))]});
 }
}
export const auth=new AuthService();
