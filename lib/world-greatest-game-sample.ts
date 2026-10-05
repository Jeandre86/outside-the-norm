import type {Project} from "./content";
export const worldGreatestGameSample:Partial<Project>={
 sampleContent:true,
 headline:"One game. A world of possibility",
 description:"An illustrative brand-identity story for World Greatest Game: bringing the energy of play into one confident visual direction.",
 role:"For this example, Ontwrp’s scope centres on brand identity: defining the visual direction and showing how it could hold together across a range of brand touchpoints.",
 challenge:"The imagined brief\n\nWorld Greatest Game needs an identity with the confidence to stand out and the flexibility to bring different audiences together. The challenge is to express the energy of play without relying on familiar sporting clichés.\n\nThe design question is simple: how can one identity feel competitive, welcoming, and recognisable at the same time?",
 research:"A starting point for exploration\n\nThis sample story proposes looking at how people recognise and connect with brands around play: the role of bold shapes, expressive typography, and clear visual signals.\n\nA real discovery phase would establish the audience, competitive context, and the brand’s own point of view. Those findings would replace this illustrative narrative.",
 process:"Find the central idea\n\nThe proposed direction starts with a shared idea: a game can create connection across differences. That idea becomes the filter for the visual exploration.\n\nExplore the visual language\n\nThe example process moves through wordmark studies, shape, colour, and typography. Each route would be judged on recognition, clarity, and how well it expresses the brand’s character.\n\nRefine it as a system\n\nRather than evaluating the mark alone, the identity would be explored across digital and campaign contexts. This would reveal where the system needs more flexibility or a stronger point of focus.",
 solution:"A recognisable idea, carried through every detail\n\nThe illustrative solution is a bold, flexible identity built around an expressive mark, a clear typographic hierarchy, and a focused colour palette. The intention is to create a system that can feel energetic in a campaign and clear in everyday communication.\n\nActual design decisions, colours, typography, and final artwork will be added when the project material is available.",
 deliverables:"Illustrative scope, to be confirmed against the actual project:\n\n• Core identity direction\n• Logo and wordmark variations\n• Colour and typography system\n• Supporting graphic language\n• Example digital applications\n• Guidance for consistent use",
 outcome:"What the identity is intended to achieve\n\nThe proposed result is a brand that feels coherent, distinctive, and easy to recognise across different contexts. This is a design intention, not a measured project result.\n\nClient feedback, approved work, and any verified outcomes will replace this section before the case study is presented as a finished account.",
 caseLayout:{layout:"editorial",galleryLayout:"interleaved",sectionOrder:["challenge","role","research","process","solution","deliverables","outcome"]}
};
export function applySampleWhenEmpty(project:Project):Project{
 const hasStory=[project.challenge,project.role,project.research,project.process,project.solution,project.deliverables,project.outcome].some(text=>text?.trim());
 if(project.id!=="world-greatest-game"||project.sampleContent!==undefined||hasStory)return project;
 return {...project,...worldGreatestGameSample,description:project.description||worldGreatestGameSample.description||"",headline:project.headline||worldGreatestGameSample.headline,caseLayout:project.caseLayout||worldGreatestGameSample.caseLayout};
}
