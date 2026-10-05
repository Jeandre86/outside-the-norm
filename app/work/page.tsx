import type {Metadata} from "next";
import {readProjects} from "@/lib/storage";
import {newestProjects} from "@/lib/content";
import ProjectGrid from "../project-grid";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Our work — Ontwrp",description:"Explore Ontwrp’s brand identity, logo and digital design projects."};
export default async function Work(){
 const {projects}=await readProjects();const visible=newestProjects(projects);
 return <main className="work-index section"><a className="back-link" href="/#work">Back to home</a><div className="work-intro"><p className="eyebrow">THE PROJECT COLLECTION</p><h1>Our work<span>.</span></h1><p>Explore the thinking, the process, and the design behind each project.</p></div>{visible.length?<ProjectGrid projects={visible}/>:<p>New work will be shared here soon.</p>}</main>
}
