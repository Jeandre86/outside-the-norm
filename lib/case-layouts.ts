import {z} from "zod";
export const sectionKeys=["challenge","role","research","process","solution","deliverables","outcome"] as const;
export type SectionKey=typeof sectionKeys[number];
export const sectionLabels:Record<SectionKey,string>={challenge:"The challenge",role:"Our role",research:"Research & insights",process:"The design process",solution:"The solution",deliverables:"What we delivered",outcome:"The outcome"};
export const layoutSchema=z.object({
 layout:z.enum(["editorial","showcase","journey","transformation"]),
 galleryLayout:z.enum(["stack","grid","interleaved"]),
 sectionOrder:z.array(z.enum(sectionKeys)).length(sectionKeys.length).refine(v=>new Set(v).size===sectionKeys.length,"Include each section once.")
});
export type CaseLayout=z.infer<typeof layoutSchema>;
export const presetSchema=layoutSchema.extend({id:z.string().min(1).max(100),name:z.string().trim().min(1).max(80)});
export type CasePreset=z.infer<typeof presetSchema>;
export const baseLayouts=[
 {id:"editorial",name:"Editorial",description:"A clear story, generous typography, and visuals woven between chapters.",layout:"editorial",galleryLayout:"interleaved",sectionOrder:[...sectionKeys]},
 {id:"showcase",name:"Visual Showcase",description:"Lead with the finished work, then unpack the ideas behind it.",layout:"showcase",galleryLayout:"grid",sectionOrder:["role","solution","challenge","research","process","deliverables","outcome"]},
 {id:"journey",name:"UX Journey",description:"A chapter index and numbered stages for research, decisions, and outcomes.",layout:"journey",galleryLayout:"interleaved",sectionOrder:[...sectionKeys]}
,
 {id:"transformation",name:"Brand Transformation",description:"Frame the challenge, explore the direction, and finish with a clear outcome.",layout:"transformation",galleryLayout:"grid",sectionOrder:["challenge","research","process","solution","deliverables","role","outcome"]}
] satisfies (CasePreset&{description:string})[];
export function resolveLayout(value?:Partial<CaseLayout>):CaseLayout {
 const fallback=baseLayouts.find(p=>p.layout===value?.layout)||baseLayouts[0];
 const result=layoutSchema.safeParse({...fallback,...value});
 return result.success?result.data:{layout:fallback.layout,galleryLayout:fallback.galleryLayout,sectionOrder:[...fallback.sectionOrder]};
}
