import {authClient} from './supabase/server';
export async function currentUser() {
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return null;
  const {data:{user},error}=await (await authClient()).auth.getUser();
  return error ? null : user;
}
export async function isEditor() {
  const allowed=process.env.EDITOR_EMAIL;
  const user=await currentUser();
  return !!allowed && !!user?.email_confirmed_at && !user.is_anonymous && user.email?.toLowerCase()===allowed.toLowerCase();
}
export function sameOrigin(r:Request){return r.headers.get('origin')===new URL(r.url).origin;}
