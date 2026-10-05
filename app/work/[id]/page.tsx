import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {readProjects} from "@/lib/storage";
import CaseStudyContent from "@/app/case-study-content";
export const dynamic="force-dynamic";
type Props={params:Promise<{id:string}>;searchParams:Promise<{from?:string}>};
async function findProject(id:string){const {projects}=await readProjects();return projects.find(p=>p.id===id&&p.status!=="draft")}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {id}=await params;const p=await findProject(id);return {title:p?`${p.name} — Ontwrp case study`:"Project not found — Ontwrp",description:p?.description||`${p?.name||"Design"} — work by Ontwrp.`,...(p?.sampleContent?{robots:{index:false,follow:false}}:{})}}
export default async function CaseStudy({params,searchParams}:Props){const {id}=await params;const p=await findProject(id);if(!p)notFound();const {from}=await searchParams;return <CaseStudyContent project={p} from={from}/>}
