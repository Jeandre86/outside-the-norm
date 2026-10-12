import type {Project} from "./content";
import {applyWorldGreatestGameSample,worldGreatestGameSample} from "./world-greatest-game-sample";

const introductions:Record<string,{headline:string;description:string}>={
 kleva:{headline:"A clearer way forward",description:"An illustrative design story for Kleva: exploring a clear, consistent visual direction. The actual brief and project scope are still to be added."},
 karos:{headline:"Recognition starts with a mark",description:"Logo design for Karos Avontuurplaas, combining mountain-inspired lettering with a compass motif."},
 "world-transplant-aquatics":{headline:"A shared identity. A stronger connection",description:"An illustrative design story for World Transplant Aquatics: exploring a coherent visual direction. The actual brief and project scope are still to be added."}
};

export function applySampleWhenEmpty(project:Project):Project{
 if(project.id==="world-greatest-game")return applyWorldGreatestGameSample(project);
 const intro=introductions[project.id];
 const hasStory=[project.challenge,project.role,project.research,project.process,project.solution,project.deliverables,project.outcome].some(text=>text?.trim());
 if(!intro||project.sampleContent!==undefined||hasStory)return project;
 const logo=project.id==="karos";
 return {...project,
  sampleContent:true,
  headline:project.headline||intro.headline,
  description:project.description||intro.description,
  caseLayout:project.caseLayout||worldGreatestGameSample.caseLayout,
  challenge:`The imagined brief\n\n${logo?"Karos needs a logo that is distinctive, legible, and adaptable across sizes.":`${project.name} needs a visual direction that feels clear and consistent across its key touchpoints.`} This is a placeholder brief; the client's actual needs and audience will replace this text.`,
  role:logo?"Ontwrp created the Karos Avontuurplaas logo. The scope presented here is logo design.":`This example describes a possible design contribution for ${project.name}. The agreed service, responsibilities, and project boundaries will be added once confirmed.`,
  research:"A starting point for discovery\n\nA proposed discovery phase would clarify the audience, context, and visual references. No research findings are claimed here. Replace this section with the actual insights that informed the work.",
  process:logo?"Explore the idea\n\nThe illustrative process begins with different mark and wordmark directions.\n\nRefine the form\n\nShape, spacing, balance, and legibility would be evaluated as the direction develops.\n\nCheck the applications\n\nThe mark would be considered at small and large sizes, in colour and monochrome. Replace these proposed stages with the real design process.":"Define the direction\n\nThe example process begins by clarifying the design problem and exploring possible visual directions.\n\nDevelop the system\n\nThe preferred direction would be refined across relevant touchpoints.\n\nBring it together\n\nApproved designs and actual project milestones will replace this illustrative process.",
  solution:logo?"A mark with a clear purpose\n\nThe proposed solution is a focused logo with a recognisable silhouette and carefully considered typography. Final artwork and the rationale behind the approved design will be added here.":`A coherent visual direction\n\nThis illustrative solution brings the intended character of ${project.name} into a consistent design language. Approved artwork, design decisions, and project-specific details will replace this placeholder.`,
  deliverables:logo?"Karos Avontuurplaas logo design":"Project deliverables to be confirmed\n\nAdd the approved designs, final assets, and handover materials here. The service and output list will reflect the actual project scope.",
  outcome:"The intended effect\n\nThe example aims for greater clarity, consistency, and recognition. These are design intentions, not measured results. Replace this section with approved client feedback and verified outcomes when available."
 };
}
