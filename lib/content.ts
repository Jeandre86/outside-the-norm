import type {CaseLayout} from "./case-layouts";
export type Project={id:string;name:string;service:string;description:string;status:"unlabelled"|"completed"|"in-progress"|"draft";image:string;alt:string;
 website?:string;
 headline?:string;
 sampleContent?:boolean;
 caseLayout?:CaseLayout;
 publishedAt?:string;
 challenge?:string;
 role?:string;
 research?:string;
 process?:string;
 solution?:string;
 deliverables?:string;
 outcome?:string;
 gallery?:{image:string;alt:string;caption:string;format?:"wide"|"paired";after?:"challenge"|"role"|"research"|"process"|"solution"|"deliverables"|"outcome"}[];
};
export const defaults:Project[]=[{id:"kleva",name:"Kleva",service:"",description:"",status:"unlabelled",image:"",alt:""},{id:"world-greatest-game",name:"World Greatest Game",service:"Brand identity",description:"",status:"unlabelled",image:"",alt:""},{id:"karos",name:"Karos",service:"Logo design",description:"",status:"unlabelled",image:"",alt:""},{id:"world-transplant-aquatics",name:"World Transplant Aquatics",service:"",description:"",status:"unlabelled",image:"",alt:""}];

export function newestProjects(projects:Project[]){
 return projects.filter(p=>p.status!=="draft").map((project,index)=>({project,index})).sort((a,b)=>(b.project.publishedAt||"").localeCompare(a.project.publishedAt||"")||a.index-b.index).map(item=>item.project);
}

export const transplantAquaticsCover="/images/transplant-aquatics-work-cover.png";
export const karosCover="/images/karos-card-showcase.png";
export const klevaCover="/images/kleva-showcase.png";
export const wggCover="/images/wgg-brand-showcase.png";
export function withProjectCover(project:Project):Project{
 if(project.id==="kleva"&&!project.image)return {...project,image:klevaCover,alt:"Kleva logo card and app dashboard on a smartphone in a dark studio; presentation mockup"};
 if(project.id==="world-greatest-game"&&!project.image)return {...project,image:wggCover,alt:"World’s Greatest Game brand identity presented on a white card beside blue, yellow and orange cards; presentation mockup"};
 if(project.id==="karos"&&(!project.image||project.image==="/images/karos-logo-cover.png"))return {...project,service:"Logo design",image:karosCover,alt:"Karos Avontuurplaas logo presented on a forest-green card with a mountain backdrop; presentation mockup"};
 return project.id==="world-transplant-aquatics"&&!project.image
  ? {...project,image:transplantAquaticsCover,alt:"Transplant Aquatics rankings interface on a desktop monitor with navy and cyan pool-water lighting; presentation mockup"}
  : project;
}
