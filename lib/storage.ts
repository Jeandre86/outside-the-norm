import {applySampleWhenEmpty} from "./case-study-samples";
import {env} from "cloudflare:workers";
import {defaults,withProjectCover,type Project} from "./content";
export function database(){const db=(env as unknown as {DB:D1Database}).DB;if(!db)throw Error("Database unavailable");return db}
export function bucket(){const b=(env as unknown as {BUCKET:R2Bucket}).BUCKET;if(!b)throw Error("Uploads unavailable");return b}
export async function readProjects(){const row=await database().prepare("SELECT data,revision FROM content WHERE id = ?").bind("projects").first<{data:string;revision:number}>();return {projects:(row?JSON.parse(row.data) as Project[]:defaults).map(applySampleWhenEmpty).map(withProjectCover),revision:row?.revision??0}}
