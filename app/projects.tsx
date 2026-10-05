"use client";
import {useEffect,useState} from "react";
import {defaults,type Project} from "@/lib/content";
export default function Projects({inProgress=false}:{inProgress?:boolean}){
 const [projects,setProjects]=useState<Project[]>(defaults);const [failed,setFailed]=useState(false);
 useEffect(()=>{fetch("/api/projects").then(async r=>{if(!r.ok)throw Error();const d=await r.json() as {projects:Project[]};setProjects(d.projects.filter(p=>p.status!=="draft"))}).catch(()=>setFailed(true))},[]);
 const shown=projects.filter(p=>inProgress?p.status==="in-progress":p.status!=="in-progress");
 if(inProgress&&!shown.length)return null;
 const content=<>{failed&&<p role="status">Project updates are temporarily unavailable.</p>}<div className="project-grid" id={inProgress?"progress-grid":"project-grid"}>{shown.map((p,i)=><article key={p.id}><div className={"project-cover cover-"+i%4}><img loading="lazy" width={1536} height={1024} src={p.image||(i%2===0?"/images/identity-preview.png":"/images/digital-preview.png")} alt={p.image?(p.alt||p.name):""}/>{!p.image&&<span className="preview-label">Preview imagery</span>}</div><div className="project-caption"><div><h3>{p.name}</h3>{p.service&&<p>{p.service}</p>}</div>{p.status!=="unlabelled"&&<span className="status-label">{p.status==="completed"?"Completed":"In progress"}</span>}</div>{p.description&&<p className="project-description">{p.description}</p>}</article>)}</div></>;
 return inProgress?<section className="section in-progress"><p className="eyebrow">ON THE DRAWING BOARD</p><h2>Taking shape<span>.</span></h2>{content}</section>:content;
}
