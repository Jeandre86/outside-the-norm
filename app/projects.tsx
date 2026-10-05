"use client";
import {useEffect,useState} from "react";
import {defaults,newestProjects,type Project} from "@/lib/content";
import ProjectGrid from "./project-grid";
export default function Projects({inProgress=false}:{inProgress?:boolean}){
 const [projects,setProjects]=useState<Project[]>(defaults);const [failed,setFailed]=useState(false);
 useEffect(()=>{fetch("/api/projects").then(async r=>{if(!r.ok)throw Error();const d=await r.json() as {projects:Project[]};setProjects(d.projects)}).catch(()=>setFailed(true))},[]);
 const shown=newestProjects(projects).filter(p=>inProgress?p.status==="in-progress":p.status!=="in-progress").slice(0,2);
 if(inProgress&&!shown.length)return null;
 const content=<>{failed&&<p role="status">Project updates are temporarily unavailable.</p>}<ProjectGrid projects={shown} from="home" id={inProgress?"progress-grid":"project-grid"}/></>;
 return inProgress?<section className="section in-progress"><p className="eyebrow">ON THE DRAWING BOARD</p><h2>Taking shape<span>.</span></h2>{content}</section>:content;
}
