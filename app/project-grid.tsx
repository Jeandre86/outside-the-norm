import type {Project} from "@/lib/content";
export default function ProjectGrid({projects,from="work",id="project-grid"}:{projects:Project[];from?:"home"|"work";id?:string}){
 return <div className="project-grid" id={id}>{projects.map((p,i)=><article key={p.id}>
   <a className="project-card-link" href={`/work/${encodeURIComponent(p.id)}${from==="home"?"?from=home":""}`} aria-label={`View ${p.name} case study`}>
    <div className={"project-cover cover-"+i%4+(p.id==="world-transplant-aquatics"?" transplant-cover":p.id==="karos"?" karos-cover":p.id==="world-greatest-game"?" wgg-cover":p.id==="kleva"?" kleva-cover":p.id==="transplant-sports"?" transplant-sports-cover":"")}><img loading="lazy" width={1536} height={1024} src={p.image||(i%2===0?"/images/identity-preview.png":"/images/digital-preview.png")} alt={p.image?(p.alt||p.name):""}/>{!p.image&&<span className="preview-label">Preview imagery</span>}<span className="case-study-label">View case study</span></div>
    <div className="project-caption"><div><h3>{p.name}</h3>{p.service&&<p>{p.service}</p>}</div>{p.id!=="world-greatest-game"&&p.status!=="unlabelled"&&<span className="status-label">{p.status==="completed"?"Completed":"In progress"}</span>}</div>
    {p.description&&<p className="project-description">{p.description}</p>}
   </a>
 </article>)}</div>
}
