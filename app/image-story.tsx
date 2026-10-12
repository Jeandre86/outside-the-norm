import {Fragment} from "react";
import type {Project} from "@/lib/content";
import {resolveLayout,sectionLabels} from "@/lib/case-layouts";
import ProjectGrid from "./project-grid";
import ContactButton from "./contact-button";

export default function ImageStory({project:p,from,related}:{project:Project;from?:string;related:Project[]}){
 const layout=resolveLayout(p.caseLayout);
 const chapters=layout.sectionOrder.filter(key=>p[key]?.trim());
 const gallery=p.gallery||[];
 const wgg=p.id==="world-greatest-game";
 const cover=p.image||(p.sampleContent?"/images/identity-preview.png":"");
 function images(items:typeof gallery){return items.length?<div className={`story-images story-images-${layout.galleryLayout}`}>{items.map((item,i)=><figure className={item.format==="paired"?"story-image-paired":"story-image-wide"} key={item.image+i}><a href={item.image} target="_blank" rel="noreferrer" aria-label={`Open full image: ${item.alt||p.name}`}><img src={item.image} alt={item.alt||`${p.name} design detail`} loading="lazy"/></a>{item.caption&&<figcaption>{item.caption}</figcaption>}</figure>)}</div>:null}
 return <main className="image-story">
 <header className="story-intro"><a className="back-link" href={from==="home"?"/#work":"/work"}>← Back to {from==="home"?"latest":"all"} work</a><p className="eyebrow">{p.name} / {p.service||"Design"}</p><h1>{p.headline||p.name}<span>.</span></h1><p className="story-summary">{p.description}</p><dl className="story-facts"><div><dt>Client</dt><dd>{p.name}</dd></div><div><dt>Scope</dt><dd>{p.service||"Design"}</dd></div>{p.status!=="unlabelled"&&<div><dt>Status</dt><dd>{p.status==="completed"?"Completed":"In progress"}</dd></div>}{wgg&&<div><dt>Next phase</dt><dd>App build</dd></div>}</dl></header>
 {p.sampleContent&&<aside className="sample-copy-banner">Illustrative case study — placeholder copy. Project details and outcomes are awaiting confirmation.</aside>}
 {cover&&<figure className="story-hero"><img src={cover} alt={p.alt||`${p.name} presentation mockup`}/></figure>}
 <div className="story-content">{chapters.map((key,index)=><Fragment key={key}><section className="story-chapter" id={`case-${key}`}><p className="eyebrow">{String(index+1).padStart(2,"0")} / {sectionLabels[key]}</p><h2>{key==="outcome"&&wgg?"An identity ready for its next chapter":sectionLabels[key]}<span>.</span></h2><div className="case-prose">{p[key]?.split(/\n\s*\n/).filter(Boolean).map((text,i)=><p key={i}>{text}</p>)}</div></section>
 {wgg&&key==="process"&&<section className="story-brand" aria-label="World’s Greatest Game colour system"><div className="story-brand-heading"><p className="eyebrow">THE VISUAL LANGUAGE</p><h2>Three rounds.<br/>One recognisable system<span>.</span></h2></div><div className="story-swatches">{[["#2563eb","01 / Describe","Electric blue"],["#ffc928","02 / One word","Golden yellow"],["#ff7919","03 / Charades","Vibrant orange"]].map(([colour,round,name])=><div key={name} style={{background:colour}}><span>{round}</span><strong>{name}</strong></div>)}</div><p className="story-caption">Round colours from the supplied identity direction, supported by midnight navy, charcoal and warm white.</p></section>}
 {wgg&&key==="solution"&&<section className="story-reference"><div className="story-chapter"><p className="eyebrow">THE IDENTITY SYSTEM</p><h2>From the mark<br/>to every touchpoint<span>.</span></h2><p className="case-prose">Logo variations, typography and application studies establish a consistent brand. Product screens in this sheet explore the future app’s visual direction.</p></div><a className="story-sheet-preview" href="/images/wgg-identity-system.png" target="_blank" rel="noreferrer" aria-label="Open the complete WGG brand identity sheet"><img src="/images/wgg-identity-system.png" alt="World’s Greatest Game identity sheet showing the symbol, logo system, colour palette, typography and application studies" loading="lazy"/><span>View the complete identity system ↗</span></a></section>}
 {layout.galleryLayout==="interleaved"&&images(gallery.filter((item,i)=>item.after?item.after===key:i===index))}
 </Fragment>)}
 {images(layout.galleryLayout==="interleaved"?gallery.filter((item,i)=>item.after?!chapters.includes(item.after):i>=chapters.length):gallery)}
 </div>
 {related.length>0&&<section className="story-related"><div className="section-heading"><h2>More work.<br/>More possibilities<span>.</span></h2><a className="text-link" href="/work">All projects ↗</a></div><ProjectGrid projects={related} id="related-projects"/></section>}
 <section className="contact-banner story-contact"><p className="eyebrow">LET’S MAKE SOMETHING LAST</p><h2>Your next chapter<br/>starts here<span>.</span></h2><ContactButton label="Start a project"/></section>
 </main>
}
