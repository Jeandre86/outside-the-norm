import type {Project} from './content';
export function applyKlevaStory(project:Project):Project{
 if(project.id!=="kleva")return project;
 const hasStory=[project.challenge,project.role,project.process,project.solution].some(text=>text?.trim());
 if(project.sampleContent===false||hasStory&&!project.sampleContent)return project;
 return {...project,service:"Logo design & App design",sampleContent:false,
 headline:"All your rewards. One Kleva app",
 description:"Logo and app design for Kleva, bringing loyalty cards, deals and vouchers into a shared visual language. Three supplied concepts explore how that experience can be introduced to customers.",
 caseLayout:{layout:"image-story",galleryLayout:"interleaved",sectionOrder:["challenge","role","research","process","solution","deliverables","outcome"]},
 challenge:"Making everyday rewards easier to navigate\n\nKleva’s design brings linked loyalty programmes, relevant deals, vouchers and cards together. The central design intention is to make the next action clear: find a deal, see what unlocks it, and access the card or code needed at the till.",
 role:"Ontwrp’s scope: logo design and app design. The supplied website concept sheets provide the structure for this presentation, showing how the product and its visual language can be communicated.",
 research:"",
 process:"One app for every reward\n\nThe first concept introduces the product through its dashboard, linked programmes and everyday tasks. Dark navy surfaces keep the interface cohesive; yellow highlights draw attention to primary actions. Colourful programme cards help distinguish memberships at a glance.",
 solution:"Discover the value. Then take the next step.\n\nThe deals-directory concept puts browsing first, with search, category filters and clear offer cards. Membership requirements sit alongside each offer, connecting discovery to the app experience.\n\nA third direction introduces Kai through a conversational interface, with prompts about redeeming deals, nearby offers and choosing a loyalty card. Student-focused messaging gives this concept its own tone.",
 deliverables:"Logo design\n\nA recognisable Kleva mark and wordmark carried into the product presentation.\n\nApp design\n\nA visual direction spanning the dashboard, deals, vouchers, loyalty cards and Kai. The accompanying concept sheets show three ways to present that experience: product overview, deals directory and conversational discovery.",
 outcome:"A connected design direction\n\nThe supplied work presents a consistent relationship between the Kleva logo, product screens and customer-facing concepts. These are design presentations; launch status and measured results have not been supplied.",
 gallery:project.gallery?.length?project.gallery:[
 {image:"/images/kleva-rewards-concept.png",alt:"Kleva product overview concept with dashboard, loyalty cards, vouchers and Kai",caption:"01 — One app for every reward. Supplied concept sheet.",format:"wide",after:"process"},
 {image:"/images/kleva-deals-concept.png",alt:"Kleva deals directory concept showing search, categories and membership offers",caption:"02 — Deals directory. Supplied concept sheet.",format:"paired",after:"solution"},
 {image:"/images/kleva-kai-concept.png",alt:"Kleva Meet Kai concept with conversational guidance and student-focused messaging",caption:"03 — Meet Kai. Supplied concept sheet.",format:"paired",after:"solution"}]
 };
}
