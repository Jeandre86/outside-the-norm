import {includeTransplantSports} from "./transplant-sports";
import {applySampleWhenEmpty} from "./case-study-samples";
import {database,bucket} from "./supabase/storage";
export {database,bucket};
import {defaults,withProjectCover,type Project} from "./content";
export async function readProjects(){const row=await database().prepare("SELECT data,revision FROM content WHERE id = ?").bind("projects").first<{data:string;revision:number}>();return {projects:includeTransplantSports(row?JSON.parse(row.data) as Project[]:defaults).map(project=>({...project,...Object.fromEntries(["description","role","challenge","research","process","solution","deliverables","outcome"].filter(key=>typeof project[key as keyof Project]==="string").map(key=>[key,(project[key as keyof Project] as string).replaceAll("Ontwrp","Outside the Norm")]))})).map(applySampleWhenEmpty).map(withProjectCover),revision:row?.revision??0}}
