import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'otn-billing-'));
try{
 for(const name of ['billing','billing-api']){
 const out=join(dir,name+'.mjs');
 await build({entryPoints:[`tests/${name}.test.ts`],bundle:true,platform:'node',format:'esm',outfile:out,plugins:name==='billing-api'?[{name:'test-only-boundaries',setup(b){
 b.onResolve({filter:/cloudflare:workers/},()=>({path:'env',namespace:'mock'}));
 b.onResolve({filter:/editor-auth$/},()=>({path:'auth',namespace:'mock'}));
 b.onResolve({filter:/(^|\/)storage$/},()=>({path:'storage',namespace:'mock'}));
 b.onLoad({filter:/.*/,namespace:'mock'},({path})=>({contents:path==='env'?`export const env=new Proxy({}, {get:(_,key)=>globalThis.mailEnv?.[key]});`:path==='auth'?`export async function isEditor(){return globalThis.authorized} export function sameOrigin(r){return r.headers.get('origin')===new URL(r.url).origin}`:`export function database(){return {prepare(sql){let args;return {bind(...v){args=v;return this},async first(){return globalThis.billingRow?structuredClone(globalThis.billingRow):null},async run(){if(sql.startsWith('INSERT')){if(globalThis.billingRow)return {meta:{changes:0}};globalThis.billingRow={data:args[1],revision:1};return {meta:{changes:1}}}if(globalThis.billingRow?.revision!==args[2])return {meta:{changes:0}};globalThis.billingRow={data:args[0],revision:args[2]+1};return {meta:{changes:1}}}}}}}`}));
 }}]:[]});execFileSync(process.execPath,[out],{stdio:'inherit'});
 }
}finally{rmSync(dir,{recursive:true,force:true})}
