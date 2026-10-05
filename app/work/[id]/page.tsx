import type {Metadata} from "next";
import {notFound} from "next/navigation";
import {readProjects} from "@/lib/storage";
import ContactButton from "@/app/contact-button";
export const dynamic="force-dynamic";
type Props={params:Promise<{id:string}>;searchParams:Promise<{from?:string}>};
async function findProject(id:string){const {projects}=await readProjects();return projects.find(p=>p.id===id&&p.status!=="draft")}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {id}=await params;const p=await findProject(id);return {title:p?`${p.name} — Ontwrp case study`:"Project not found — Ontwrp",description:p?.description||`${p?.name||"Design"} — work by Ontwrp.`}}
export default async function CaseStudy({params,searchParams}:Props){
 const {id}=await params;const p=await findProject(id);if(!p)notFound();const {from}=await searchParams;
 const sections=[["01","The challenge",p.challenge],["02","Our role",p.role],["03","Research & insights",p.research],["04","The design process",p.process],["05","The solution",p.solution],["06","What we delivered",p.deliverables],["07","The outcome",p.outcome]].filter(([, ,text])=>text?.trim());
 return <main className="case-study"><div className="section case-intro"><a className="back-link" href={from==="home"?"/#work":"/work"}>{from==="home"?"Back to latest work":"Back to all work"}</a><p className="eyebrow">PROJECT CASE STUDY</p><h1>{p.name}<span>.</span></h1>{p.description&&<p className="case-summary">{p.description}</p>}<dl className="case-facts"><div><dt>Client</dt><dd>{p.name}</dd></div>{p.service&&<div><dt>Services</dt><dd>{p.service}</dd></div>}{p.status!=="unlabelled"&&<div><dt>Status</dt><dd>{p.status==="completed"?"Completed":"In progress"}</dd></div>}</dl></div>
 {p.image&&<figure className="case-cover"><img src={p.image} alt={p.alt||p.name} width={1536} height={1024}/></figure>}
 <div className="section case-body">{sections.length?sections.map(([n,title,text])=><section className="case-section" key={n}><div><p className="eyebrow">{n}</p><h2>{title}<span>.</span></h2></div><div className="case-prose">{text?.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div></section>):<section className="case-section"><h2>Behind the work<span>.</span></h2><p className="case-prose">The full story behind this project is coming soon.</p></section>}
 {!!p.gallery?.length&&<section className="case-gallery" aria-label="Project design gallery">{p.gallery.map((image,i)=><figure key={image.image+String(i)}><img loading="lazy" src={image.image} alt={image.alt||`${p.name} project detail ${i+1}`} width={1536} height={1024}/>{image.caption&&<figcaption>{image.caption}</figcaption>}</figure>)}</section>}
 </div><section className="contact-banner"><h2>Have a project in mind<span>?</span></h2><p>Let’s find its direction.</p><ContactButton label="Start a project"/><a className="secondary-link" href="/work">Explore all work</a></section></main>
}
