import { Client, Account, TablesDB, ID, Query, Permission, Role } from "https://cdn.jsdelivr.net/npm/appwrite@21.4.0/+esm";

export const APPWRITE = Object.freeze({
  endpoint: "https://nyc.cloud.appwrite.io/v1",
  projectId: "diamond-game",
  databaseId: "diamond"
});

export const client = new Client().setEndpoint(APPWRITE.endpoint).setProject(APPWRITE.projectId);
export const account = new Account(client);
export const db = new TablesDB(client);
export { ID, Query, Permission, Role };

export async function ensureSession(){
  try{return await account.get();}
  catch{
    await account.createAnonymousSession();
    return account.get();
  }
}
