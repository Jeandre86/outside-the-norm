import type {CaseLayout} from "./case-layouts";
export type Project={id:string;name:string;service:string;description:string;status:"unlabelled"|"completed"|"in-progress"|"draft";image:string;alt:string;
 sortOrder?:number;
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

export function orderedProjects(projects:Project[]){
 return projects.map((project,index)=>({project,index})).sort((a,b)=>{
 const ao=a.project.sortOrder,bo=b.project.sortOrder;
 if(ao!==undefined||bo!==undefined){if(ao===undefined)return 1;if(bo===undefined)return -1;if(ao!==bo)return ao-bo;}
 return (b.project.publishedAt||"").localeCompare(a.project.publishedAt||"")||a.index-b.index;
 }).map(item=>item.project);
}
export function newestProjects(projects:Project[]){return orderedProjects(projects).filter(p=>p.status!=="draft");}
export function moveProject(projects:Project[],id:string,target:number){
 const rows=orderedProjects(projects);const from=rows.findIndex(p=>p.id===id);if(from<0||target<0||target>=rows.length)return rows;
 const [project]=rows.splice(from,1);rows.splice(target,0,project);return rows.map((p,index)=>({...p,sortOrder:index}));
}

export const transplantAquaticsCover="/images/transplant-aquatics-work-2026.png";
export const karosCover="/images/karos-work-2026.png";
export const klevaCover="/images/kleva-work-2026.png";
export const wggCover="/images/wgg-work-2026.png";
export function withProjectCover(project:Project):Project{
 const refreshed:Record<string,string>={"/images/karos-card-showcase.png":"/images/karos-work-2026.png","/images/kleva-showcase-v2.png":"/images/kleva-work-2026.png","/images/transplant-sports-showcase-v2.png":"/images/transplant-sports-work-2026.png","/images/transplant-aquatics-work-cover.png":"/images/transplant-aquatics-work-2026.png","/images/wgg-brand-showcase.png":"/images/wgg-work-2026.png"};
 if(refreshed[project.image])project={...project,image:refreshed[project.image]};
 if(project.id==="transplant-sports"&&(!project.image||project.image==="/images/transplant-sports-logo.png"||project.image==="/images/transplant-sports-showcase.png"))return {...project,image:"/images/transplant-sports-work-2026.png",alt:"Transplant Sports logo card and desktop monitor; presentation mockup"};
 if(project.id==="kleva"&&(!project.image||project.image==="/images/kleva-showcase.png"))return {...project,image:klevaCover,alt:"Kleva logo card and app dashboard on a smartphone in a dark studio; presentation mockup"};
 if(project.id==="world-greatest-game"&&!project.image)return {...project,image:wggCover,alt:"World’s Greatest Game brand identity presented on a white card beside blue, yellow and orange cards; presentation mockup"};
 if(project.id==="karos"&&(!project.image||project.image==="/images/karos-logo-cover.png"))return {...project,service:"Logo design",image:karosCover,alt:"Karos Avontuurplaas logo presented on a forest-green card with a mountain backdrop; presentation mockup"};
 return project.id==="world-transplant-aquatics"&&!project.image
  ? {...project,image:transplantAquaticsCover,alt:"Transplant Aquatics rankings interface on a desktop monitor with navy and cyan pool-water lighting; presentation mockup"}
  : project;
}
