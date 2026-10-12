import type {Project} from "./content";
export const worldGreatestGameSample:Partial<Project>={
 name:"World’s Greatest Game",
 service:"Brand identity",
 status:"completed",
 sampleContent:false,
 headline:"Three rounds. One unmistakable identity",
 description:"A brand identity for World’s Greatest Game, built around a crown-inspired W, bold typography and three energetic round colours. Brand identity complete; app build is the next phase.",
 challenge:"A shared identity for a competitive party game\n\nThe identity sheet presents a game that moves through three rounds: Describe, One Word and Charades. The visual system gives those different modes a shared, recognisable identity.",
 role:"Ontwrp’s completed scope is brand identity. The next planned phase is the app build. Product screens in the identity system illustrate how the brand can appear in a digital experience; they do not represent a completed app build.",
 research:"Reading the identity\n\nThis case study describes the supplied brand identity system. It does not claim user interviews, usability testing or measured research findings.",
 process:"A central symbol\n\nThe angular W combines a crown-like silhouette with an underline, giving the identity a compact focal point.\n\nA flexible logo system\n\nThe identity includes a full name treatment, a compact WGG lockup and light and dark variants.\n\nA consistent visual language\n\nMidnight navy, charcoal and warm white provide the foundation. Electric blue, golden yellow and vibrant orange distinguish the three rounds, while Outfit and Montserrat establish the typography.",
 solution:"Competitive energy, clearly organised\n\nThe blue-to-cyan symbol and bold wordmark establish recognition. The three accent colours carry the identity into round-based communication, supported by a calm dark-and-light foundation. The supplied system shows digital, social and physical application examples.",
 deliverables:"Completed scope: brand identity\n\n• Crown-inspired W symbol\n• Logo lockups and light/dark variants\n• Colour palette\n• Typography system\n• Brand application examples\n\nThe showcase card is a presentation mockup of the identity.",
 outcome:"Brand identity complete. App build next.\n\nThe identity establishes the visual foundation for the next phase of the product. The app build is planned next; no launch results or performance metrics are claimed.",
 caseLayout:{layout:"image-story",galleryLayout:"interleaved",sectionOrder:["challenge","role","research","process","solution","deliverables","outcome"]}
};
export function applyWorldGreatestGameSample(project:Project):Project{
 if(project.id!=="world-greatest-game")return project;
 const hasStory=[project.challenge,project.role,project.research,project.process,project.solution,project.deliverables,project.outcome].some(text=>text?.trim());
 if(project.sampleContent===false||hasStory&&!project.sampleContent)return project;
 return {...project,...worldGreatestGameSample,caseLayout:project.caseLayout||worldGreatestGameSample.caseLayout};
}
