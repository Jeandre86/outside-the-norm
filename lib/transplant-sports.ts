import type {Project} from './content';
export const transplantSports:Project={
 id:'transplant-sports',name:'Transplant Sports',service:'Logo design & Website design',status:'unlabelled',publishedAt:'2026-10-13',website:'https://transplantsports.org.za/',image:'/images/transplant-sports-logo.png',alt:'Transplant Sports logo',sampleContent:false,
 headline:'An identity with a place to connect',description:'Logo and website design for Transplant Sports. A shared identity carried from the organisation’s mark into its online presence.',
 challenge:'An identity and an online presence\n\nThe project brings together two connected design needs: a logo for Transplant Sports and a website through which the organisation can present itself online.',
 role:'Ontwrp created the logo and designed the website. This case study focuses on those two design contributions.',
 process:'From mark to website\n\nThe logo establishes the visual point of recognition. The website carries the organisation’s identity into a digital setting, bringing the mark and page design together.',
 solution:'A connected presentation\n\nThe work pairs logo design with website design for Transplant Sports. Explore the live website through the link above to see the published presentation.',
 deliverables:'Logo design\n\nWebsite design',
 caseLayout:{layout:'image-story',galleryLayout:'interleaved',sectionOrder:['challenge','role','research','process','solution','deliverables','outcome']}
};
export function includeTransplantSports(projects:Project[]):Project[]{return projects.some(p=>p.id===transplantSports.id)?projects:[transplantSports,...projects]}
