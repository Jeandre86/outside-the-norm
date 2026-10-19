import {authClient} from '@/lib/supabase/server';
import {sameOrigin} from '@/lib/editor-auth';
import {NextResponse} from 'next/server';
export async function POST(r:Request) {
  if(!sameOrigin(r)) return new Response(null,{status:403});
  const form=await r.formData();
  const email=String(form.get('email')||'').trim(),password=String(form.get('password')||'');
  const fail=()=>NextResponse.redirect(new URL('/admin?login=failed',r.url),303);
  if(email.toLowerCase()!==process.env.EDITOR_EMAIL?.toLowerCase() || !password || password.length>1024) return fail();
  try {
    const client=await authClient();
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error || !data.user?.email_confirmed_at) return fail();
    return NextResponse.redirect(new URL('/admin',r.url),303);
  } catch { return fail(); }
}
