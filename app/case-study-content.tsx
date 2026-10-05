import {Fragment} from "react";
import type {Project} from "@/lib/content";
import {resolveLayout,sectionLabels} from "@/lib/case-layouts";
import ContactButton from "./contact-button";
export default function CaseStudyContent({project:p,from}:{project:Project;from?:string}){
 const layout=resolveLayout(p.caseLayout);
 const sections=layout.sectionOrder.filter(key=>p[key]?.trim());
 const gallery=p.gallery||[];
 function visual(index:number){const image=gallery[index];if(!image)return null;return <figure className="case-visual" key={image.image+index}><img loading="lazy" src={image.image} alt={image.alt||`${p.name} project detail ${index+1}`} width={1536} height={1024}/>{image.caption&&<figcaption>{image.caption}</figcaption>}</figure>}
 const coverImage=p.image||(p.sampleContent?"/images/identity-preview.png":"");
 const cover=coverImage?<figure className="case-cover"><img src={coverImage} alt={p.image?(p.alt||p.name):"Illustrative blank identity stationery mockup, not client artwork"} width={1536} height={1024}/>{!p.image&&<figcaption>Preview imagery — replace with approved project artwork.</figcaption>}</figure>:null;
 return <main className={`case-study case-layout-${layout.layout}`}>
 <div className="case-back section"><a className="back-link" href={from==="home"?"/#work":"/work"}>{from==="home"?"Back to latest work":"Back to all work"}</a></div>
 {p.sampleContent&&<aside className="sample-copy-banner">Illustrative case study — placeholder copy. The brief, process, and outcomes below are not verified project facts.</aside>}
 {layout.layout==="showcase"&&cover}
 <div className="section case-intro"><div className="case-title-block"><p className="eyebrow">{p.name.toUpperCase()} / {p.service||"CASE STUDY"}</p><h1>{p.headline||p.name}<span>.</span></h1>{p.description&&<p className="case-summary">{p.description}</p>}</div><dl className="case-facts"><div><dt>Client</dt><dd>{p.name}</dd></div>{p.service&&<div><dt>Services</dt><dd>{p.service}</dd></div>}{p.status!=="unlabelled"&&<div><dt>Status</dt><dd>{p.status==="completed"?"Completed":"In progress"}</dd></div>}</dl></div>
 {layout.layout!=="showcase"&&cover}
 <div className="section case-body">
 {layout.layout==="journey"&&sections.length>0&&<nav className="case-chapter-nav" aria-label="Case-study chapters"><p className="eyebrow">THE JOURNEY</p>{sections.map((key,i)=><a href={`#case-${key}`} key={key}><span>{String(i+1).padStart(2,"0")}</span>{sectionLabels[key]}</a>)}</nav>}
 <div className="case-chapters">{sections.length?sections.map((key,index)=><Fragment key={key}><section className="case-section" id={`case-${key}`}><div><p className="eyebrow">{String(index+1).padStart(2,"0")}</p><h2>{sectionLabels[key]}<span>.</span></h2></div><div className="case-prose">{p[key]?.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div></section>{layout.galleryLayout==="interleaved"&&visual(index)}</Fragment>):<section className="case-section"><h2>Behind the work<span>.</span></h2><p className="case-prose">The full story behind this project is coming soon.</p></section>}
 {gallery.length>(layout.galleryLayout==="interleaved"?sections.length:0)&&<section className={`case-gallery gallery-${layout.galleryLayout}`} aria-label="Project design gallery">{gallery.map((_,i)=>layout.galleryLayout!=="interleaved"||i>=sections.length?visual(i):null)}</section>}
 </div></div><section className="contact-banner"><h2>Have a project in mind<span>?</span></h2><p>Let’s find its direction.</p><ContactButton label="Start a project"/><a className="secondary-link" href="/work">Explore all work</a></section></main>
}
