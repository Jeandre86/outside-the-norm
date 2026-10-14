import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {readProjects} from "@/lib/storage";
import CaseStudyContent from "@/app/case-study-content";
export const dynamic="force-dynamic";
type Props={params:Promise<{id:string}>;searchParams:Promise<{from?:string}>};
async function findProject(id:string){const {projects}=await readProjects();return projects.find(p=>p.id===id&&p.status!=="draft")}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {id}=await params;const p=await findProject(id);return {title:p?`${p.name} — Outside the Norm case study`:"Project not found — Outside the Norm",description:p?.description||`${p?.name||"Design"} — work by Outside the Norm.`,...(p?.sampleContent?{robots:{index:false,follow:false}}:{})}}
export default async function CaseStudy({params,searchParams}:Props){const {id}=await params;const p=await findProject(id);if(!p)notFound();const {from}=await searchParams;const {projects}=await readProjects();return <CaseStudyContent project={p} from={from} related={projects.filter(item=>item.id!==p.id&&item.status!=="draft").slice(0,2)}/>}
