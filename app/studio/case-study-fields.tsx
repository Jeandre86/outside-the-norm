"use client";
import type {Project} from "@/lib/content";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
const fields=[
 ["challenge","The challenge","What problem or business need brought the client to Ontwrp?",10000],
 ["role","Our role","What was Ontwrp responsible for? Include the scope and any collaborators where relevant.",3000],
 ["research","Research & insights","What did you learn about the audience or users? Include only research you actually carried out.",10000],
 ["process","Design process","Explain the ideas explored, decisions made, and refinements based on feedback.",10000],
 ["solution","The solution","How did the final design address the challenge?",10000],
 ["deliverables","What we delivered","List the identities, logos, flows, prototypes, or design files you delivered.",5000],
 ["outcome","The outcome","What changed? Include verified results or learnings, without inventing metrics.",10000],
] as const;
export default function CaseStudyFields({project,onChange,onBusy,onNotice}:{project:Project;onChange:(patch:Partial<Project>)=>void;onBusy:(busy:boolean)=>void;onNotice:(message:string)=>void}){
 const gallery=project.gallery||[];
 return <div className="case-editor-fields"><h3>Case study</h3><p>Each project has its own page. Empty sections stay hidden. Add a publication date to show your newest work first.</p><a className="text-link" href={`/work/${encodeURIComponent(project.id)}`} target="_blank" rel="noreferrer">View project page</a>
 <label>Publication date<Input type="date" value={project.publishedAt||""} onChange={e=>onChange({publishedAt:e.target.value})}/></label>
 {fields.map(([key,label,hint,max])=><label key={key}>{label}<span className="field-hint">{hint}</span><Textarea rows={5} maxLength={max} value={project[key]||""} onChange={e=>onChange({[key]:e.target.value})}/></label>)}
 <h3>Project gallery</h3><p>Add up to 12 images: research, journeys, wireframes, design explorations, or final work.</p>
 {gallery.map((item,index)=><div className="gallery-editor-item" key={item.image+String(index)}><img className="studio-image" src={item.image} alt={item.alt||"Project gallery image"}/><label>Image description<Input maxLength={250} value={item.alt} onChange={e=>onChange({gallery:gallery.map((g,i)=>i===index?{...g,alt:e.target.value}:g)})}/></label><label>Caption<Textarea maxLength={1000} value={item.caption} onChange={e=>onChange({gallery:gallery.map((g,i)=>i===index?{...g,caption:e.target.value}:g)})}/></label><Button type="button" variant="outline" onClick={()=>onChange({gallery:gallery.filter((_,i)=>i!==index)})}>Remove gallery image</Button></div>)}
 {gallery.length<12&&<label>Add gallery image (PNG, JPEG, WebP; up to 8 MB)<Input type="file" accept="image/png,image/jpeg,image/webp" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;const input=e.target;onBusy(true);onNotice("Uploading gallery image…");try{const form=new FormData();form.set("file",file);const r=await fetch("/api/images",{method:"POST",body:form});const d=await r.json() as {url:string;error?:string};if(!r.ok)throw Error(d.error||"Upload failed.");onChange({gallery:[...gallery,{image:d.url,alt:"",caption:""}]});onNotice("Image uploaded. Save changes to publish it.");input.value=""}catch(error){onNotice(error instanceof Error?error.message:"Upload failed. Please try again.")}finally{onBusy(false)}}}/></label>}
 </div>
}
