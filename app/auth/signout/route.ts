import {authClient} from '@/lib/supabase/server';
import {sameOrigin} from '@/lib/editor-auth';
import {NextResponse} from 'next/server';
export async function POST(r:Request){
 if(!sameOrigin(r))return new Response(null,{status:403});
 try{const {error}=await (await authClient()).auth.signOut({scope:'local'});if(error)throw error;}
 catch{return NextResponse.redirect(new URL('/admin?logout=failed',r.url),303);}
 return NextResponse.redirect(new URL('/logged-out',r.url),303);
}
export function GET(r:Request){return NextResponse.redirect(new URL('/admin',r.url),303);}
