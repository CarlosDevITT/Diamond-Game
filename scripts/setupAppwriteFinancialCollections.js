#!/usr/bin/env node
import {Client,TablesDB,Role} from "node-appwrite";
import {APPWRITE_SCHEMAS} from "../src/constants/appwriteSchemas.js";

const required=["APPWRITE_SERVER_API_KEY"];
for(const key of required)if(!process.env[key]){console.error(`[ERROR] Variável ${key} não definida.`);process.exit(1)}
const client=new Client()
 .setEndpoint(process.env.APPWRITE_ENDPOINT||"https://nyc.cloud.appwrite.io/v1")
 .setProject(process.env.APPWRITE_PROJECT_ID||"diamond-game")
 .setKey(process.env.APPWRITE_SERVER_API_KEY);
const db=new TablesDB(client),databaseId=process.env.APPWRITE_DATABASE_ID||"diamond";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const isMissing=e=>e?.code===404;
const log=(tag,msg)=>console.log(`[${tag}] ${msg}`);

const definitions={
 wallets:{
  name:"Wallets",columns:[
   {key:"user_id",type:"varchar",size:255,required:true},
   {key:"available_balance",type:"integer",required:true,default:0},
   {key:"locked_balance",type:"integer",required:true,default:0},
   {key:"updated_at",type:"datetime",required:true}
  ],indexes:[{key:"idx_user_id",type:"unique",attributes:["user_id"],orders:["ASC"]}]
 },
 ledger_transactions:{
  name:"Ledger Transactions",columns:[
   {key:"user_id",type:"varchar",size:255,required:true},
   {key:"amount",type:"integer",required:true},
   {key:"type",type:"varchar",size:50,required:true},
   {key:"reference_id",type:"varchar",size:255,required:true},
   {key:"status",type:"varchar",size:50,required:true},
   {key:"created_at",type:"datetime",required:true}
  ],indexes:[
   {key:"idx_ledger_user",type:"key",attributes:["user_id"],orders:["ASC"]},
   {key:"idx_reference_id",type:"unique",attributes:["reference_id"],orders:["ASC"]}
  ]
 }
};

async function getTable(id){try{return await db.getTable({databaseId,tableId:id})}catch(e){if(isMissing(e))return null;throw e}}
async function waitReady(id){
 for(let i=0;i<30;i++){const t=await getTable(id);if(t?.status==="available"||!t?.status)return;t&&log("WAIT",`Coleção '${id}' status ${t.status}...`);await sleep(1000)}
 throw new Error(`Timeout aguardando coleção '${id}'.`);
}
async function ensureTable(id,def){
 let table=await getTable(id);
 if(table){log("SUCCESS",`Coleção '${id}' já existe`)}
 else{
  await db.createTable({databaseId,tableId:id,name:def.name,permissions:[],rowSecurity:true});
  log("CREATED",`Coleção '${id}' criada sem permissões de coleção; leitura é concedida por linha ao próprio usuário`);await waitReady(id);
 }
}
async function ensureColumns(id,def){
 const listed=await db.listColumns({databaseId,tableId:id});const existing=new Set((listed.columns||[]).map(c=>c.key));
 for(const col of def.columns){
  if(existing.has(col.key)){log("SUCCESS",`Atributo '${id}.${col.key}' já existe`);continue}
  const base={databaseId,tableId:id,key:col.key,required:col.required};
  if(col.type==="varchar")await db.createVarcharColumn({...base,size:col.size});
  else if(col.type==="integer")await db.createIntegerColumn({...base,default:col.default});
  else if(col.type==="datetime")await db.createDatetimeColumn(base);
  else throw new Error(`Tipo não suportado: ${col.type}`);
  log("CREATED",`Atributo '${id}.${col.key}' criado com sucesso`);await sleep(1000);
 }
}
async function ensureIndexes(id,def){
 const listed=await db.listIndexes({databaseId,tableId:id});const existing=new Set((listed.indexes||[]).map(i=>i.key));
 for(const idx of def.indexes){
  if(existing.has(idx.key)){log("SUCCESS",`Índice '${id}.${idx.key}' já existe`);continue}
  await db.createIndex({databaseId,tableId:id,key:idx.key,type:idx.type,columns:idx.attributes,orders:idx.orders});
  log("CREATED",`Índice '${id}.${idx.key}' criado com sucesso`);await sleep(1000);
 }
}
async function verifyNoClientWrite(id){
 const table=await getTable(id),permissions=table?.$permissions||[];
 if(permissions.length)throw new Error(`Permissões no nível da coleção detectadas em '${id}': ${permissions.join(", ")}. Financeiro exige row-level read e zero permissões de coleção.`);
 log("SECURITY",`'${id}': zero permissões de coleção; leitura por linha e escrita somente via Server API Key`);
}
async function main(){
 log("INFO",`Provisionando financeiro no database '${databaseId}'`);
 for(const [id,def] of Object.entries(definitions)){
  if(!APPWRITE_SCHEMAS[id])throw new Error(`Schema '${id}' ausente em appwriteSchemas.js`);
  await ensureTable(id,def);await ensureColumns(id,def);await ensureIndexes(id,def);await verifyNoClientWrite(id);
 }
 log("SUCCESS","Provisionamento financeiro concluído de forma idempotente.");
}
main().catch(e=>{console.error("[ERROR]",e?.message||e);process.exitCode=1});
