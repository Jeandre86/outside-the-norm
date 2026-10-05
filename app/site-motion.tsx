"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";

const targets=".hero-copy h1, .hero-copy p, .hero-copy .cta, .section-heading, .services article, .project-grid > article, .process-row, .case-section, .case-visual, .work-intro, .case-title-block, .discipline-strip > div, .philosophy .split > *";
export default function SiteMotion(){
 const pathname=usePathname();
 useEffect(()=>{
  if(pathname?.startsWith("/studio")||!window.IntersectionObserver||!Element.prototype.animate)return;
  const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
  const seen=new WeakSet<Element>();const active=new Set<Animation>();
  let observer:IntersectionObserver|undefined;let mutations:MutationObserver|undefined;
  function stop(){observer?.disconnect();mutations?.disconnect();active.forEach(animation=>animation.cancel());active.clear()}
  function start(){
   stop();if(preference.matches)return;
   observer=new IntersectionObserver(entries=>{
    let stagger=0;
    for(const entry of entries){
     if(!entry.isIntersecting)continue;
     observer?.unobserve(entry.target);
     const animation=entry.target.animate([{opacity:0,translate:"0 18px"},{opacity:1,translate:"0 0"}],{duration:560,delay:Math.min(stagger++*65,195),easing:"cubic-bezier(.22,1,.36,1)",fill:"backwards"});
     active.add(animation);animation.finished.then(()=>active.delete(animation)).catch(()=>active.delete(animation));
    }
   },{threshold:0,rootMargin:"0px 0px -24px 0px"});
   function discover(root:Document|Element){
    const elements=[...(root instanceof Element&&root.matches(targets)?[root]:[]),...root.querySelectorAll(targets)];
    elements.forEach(element=>{if(!seen.has(element)){seen.add(element);observer?.observe(element)}});
   }
   discover(document);
   mutations=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node instanceof Element)discover(node)})));
   mutations.observe(document.body,{childList:true,subtree:true});
  }
  start();preference.addEventListener("change",start);
  return()=>{stop();preference.removeEventListener("change",start)};
 },[pathname]);
 return null;
}
