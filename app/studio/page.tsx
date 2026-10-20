import {isEditor,currentUser} from '@/lib/editor-auth';
import AdminPanel from './admin-panel';
export const dynamic='force-dynamic';
export default async function Studio({searchParams}:{searchParams:Promise<{login?:string;logout?:string}>}) {
  const user=await currentUser();
  if(user && await isEditor())return <>{(await searchParams).logout==='failed'&&<p role="alert">Sign out failed. Please try again.</p>}<AdminPanel email={user.email!} signOut="/auth/signout"/></>;
  const params=await searchParams;
  const ready=!!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return <main className="admin-login"><section><a className="wordmark" href="/"><img className="brand-logo" src="/images/otn-stack.svg" alt="Outside the Norm"/></a><p className="eyebrow">PRIVATE WORKSPACE</p><h1>Studio login<span>.</span></h1><p>Sign in to manage clients, invoices, work and stories.</p>{!ready?<p role="status">Admin setup is in progress. Supabase login needs to be configured.</p>:<form className="admin-login-form" action="/auth/login" method="post"><label>Email<input type="email" name="email" required autoComplete="username" placeholder="you@example.com"/></label><label>Password<input type="password" name="password" required autoComplete="current-password" placeholder="Enter your password"/></label>{params.login==='failed'&&<p role="alert">Sign-in failed. Check your email and password and confirm your account has admin access.</p>}<button className="cta" type="submit">Sign in</button></form>}<a className="back-link" href="/">← Back to website</a></section></main>;
}
