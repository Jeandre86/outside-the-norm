import {env} from "cloudflare:workers";import {getChatGPTUser} from "@/app/chatgpt-auth";
export async function isEditor(){const allowed=(env as unknown as {EDITOR_EMAIL?:string}).EDITOR_EMAIL;const user=await getChatGPTUser();return !!allowed&&!!user&&user.email.toLowerCase()===allowed.toLowerCase()}
export function sameOrigin(r:Request){const origin=r.headers.get("origin");return origin===new URL(r.url).origin}
