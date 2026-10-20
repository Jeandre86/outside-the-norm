import {currentUser} from '@/lib/editor-auth';
import {redirect} from 'next/navigation';
export default async function LoggedOut(){
 if(await currentUser())redirect('/admin');
 return <main className="admin-login"><section><a className="wordmark" href="/"><img className="brand-logo" src="/images/otn-stack.svg" alt="Outside the Norm"/></a><p className="eyebrow">PRIVATE WORKSPACE</p><h1>You’re signed out<span>.</span></h1><p>You’ve signed out of your studio on this browser. Sign in again whenever you’re ready.</p><a className="cta" href="/admin">Sign in again</a><a className="back-link" href="/">← Back to website</a></section></main>;
}
